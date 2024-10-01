"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { IProfile, IProject, Project } from "@/utils/types";
import { Configuration, ContainersApi, ContainerRequest } from 'qovery-typescript-axios';
import axios from 'axios';

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = createClient();
  const origin = headers().get("origin");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = createClient();
  const origin = headers().get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return encodedRedirect("error", "/dashboard", error.message);
  }

  return redirect("/sign-in");
};

export const saveProfile = async (profile: IProfile) => {
  const supabase = createClient();

  const { data: savedProfile, error } = await supabase
  .from('profiles')
  .upsert({
    id: profile.id, 
    first_name: profile.first_name, 
    last_name: profile.last_name,
    bio: profile.bio 
  })
  .select().single();

  if (error) {
    return error;
  }

  return savedProfile;
}

export const createOrSaveProject = async (project: IProject) => {
  const supabase = createClient();

  const { data: savedProject, error } = await supabase
  .from('projects')
  .upsert({
    name: project.name, 
    description: project.description,
    user_id: project.user_id,
    id: project.id
  })
  .select().single<Project>();

  // Check if a container exists using Qovery and create one if it doesn't
  const configuration = new Configuration({
    apiKey: process.env.QOVERY_API_TOKEN
  });
  
  const containersApi = new ContainersApi(configuration);
  
  let containerInfo;

  try {
    const containersResponse = await containersApi.listContainer(project.id!);
    const projectContainer = containersResponse.data.results?.find(c => c.id === project.id);
    if (projectContainer) {
      console.log('Container exists for this project');
      containerInfo = projectContainer;
    } else {
      console.log('No container exists for this project. Creating one...');
      // ... existing container creation code ...
      // Function to find an available port
      const findAvailablePort = async (startPort: number, endPort: number): Promise<number> => {
        for (let port = startPort; port <= endPort; port++) {
          try {
            const response = await containersApi.listContainer(project.id!);
            const isPortInUse = response.data.results?.some(container => 
              container.ports?.some(p => p.external_port === port)
            );
            if (!isPortInUse) {
              return port;
            }
          } catch (error) {
            console.error(`Error checking port ${port}:`, error);
          }
        }
        throw new Error('No available ports found');
      };

      // Find an available port
      const availablePort = await findAvailablePort(11434, 11534);

      const containerRequest: ContainerRequest = {
        name: `${project.name}-container`,
        description: `Container for ${project.name}`,
        image_name: 'ollama/ollama',
        tag: 'latest',
        ports: [{
          internal_port: 11434,
          external_port: availablePort,
          publicly_accessible: false,
          protocol: 'TCP'
        }],
        cpu: 1000,
        memory: 2048,
        registry_id: '', // Add an empty string or appropriate registry ID
        healthchecks: {
          readiness_probe: {
            type: {
              tcp: {
                port: 11434,
              }
            },
            initial_delay_seconds: 10,
            period_seconds: 30,
            timeout_seconds: 5,
            success_threshold: 1,
            failure_threshold: 3
          },
          liveness_probe: {
            type: {
              tcp: {
                port: 11434,
              }
            },
            initial_delay_seconds: 10,
            period_seconds: 30,
            timeout_seconds: 5,
            success_threshold: 1,
            failure_threshold: 3
          }
        },
      };

      const createContainerResponse = await containersApi.createContainer(project.id!, containerRequest);
      containerInfo = createContainerResponse.data;
      console.log('Container created successfully:', containerInfo);
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.log('No container exists for this project. Creating one...');
      
      try {
        // Function to find an available port
        const findAvailablePort = async (startPort: number, endPort: number): Promise<number> => {
          for (let port = startPort; port <= endPort; port++) {
            try {
              const response = await containersApi.listContainer(project.id!);
              const isPortInUse = response.data.results?.some(container => 
                container.ports?.some(p => p.external_port === port)
              );
              if (!isPortInUse) {
                return port;
              }
            } catch (error) {
              console.error(`Error checking port ${port}:`, error);
            }
          }
          throw new Error('No available ports found');
        };

        // Find an available port
        const availablePort = await findAvailablePort(11434, 11534);

        const createContainerResponse = await containersApi.createContainer(
          project.id!, // Add the project ID as the first argument
          {
            name: `${project.name}-container`,
            description: `Container for ${project.name}`,
            image_name: 'ollama/ollama',
            tag: 'latest',
            ports: [{
              internal_port: 11434,
              external_port: availablePort,
              publicly_accessible: false,
              protocol: 'TCP'
            }],
            cpu: 1000,
            memory: 2048,
            registry_id: '', // Add an empty string or appropriate registry ID
            healthchecks: {
              readiness_probe: {
                type: {
                  tcp: {
                    port: 11434,
                  }
                },
                initial_delay_seconds: 10,
                period_seconds: 30,
                timeout_seconds: 5,
                success_threshold: 1,
                failure_threshold: 3
              },
              liveness_probe: {
                type: {
                  tcp: {
                    port: 11434,
                  }
                },
                initial_delay_seconds: 10,
                period_seconds: 30,
                timeout_seconds: 5,
                success_threshold: 1,
                failure_threshold: 3
              }
            },
          }
        );
        
        containerInfo = createContainerResponse.data;
        console.log('Container created successfully');
      } catch (createError) {
        console.error('Error creating container:', createError);
      }
    } else {
      console.error('Error checking container:', error);
    }
  }

  // Now containerInfo contains the container's information, whether existing or newly created
  if (containerInfo) {
    console.log('Container Info:', containerInfo);
    // You can use containerInfo for further processing if needed

    // Save container info to Supabase
    try {
      const supabase = createClient();
      const { data: savedContainer, error: containerError } = await supabase
        .from('containers')
        .upsert({
          project_id: project.id,
          container_id: containerInfo.id,
          name: containerInfo.name,
          cpu: containerInfo.cpu,
          memory: containerInfo.memory,
          external_port: containerInfo.ports?.[0]?.external_port,
          internal_port: containerInfo.ports?.[0]?.internal_port,
          publicly_accessible: containerInfo.ports?.[0]?.publicly_accessible,
          created_at: containerInfo.created_at,
          updated_at: containerInfo.updated_at
        })
        .select()
        .single();

      if (containerError) {
        console.error('Error saving container info to Supabase:', containerError);
      } else {
        console.log('Container info saved to Supabase:', savedContainer);
      }
    } catch (supabaseError) {
      console.error('Error interacting with Supabase:', supabaseError);
    }
  }

  if (error) {
    return error;
  }

  return savedProject;
}