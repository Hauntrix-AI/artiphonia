export interface IProfile {
    first_name: string
    last_name: string
    bio: string
    id: string
}

export type Profile = {
    profile: IProfile
}

export interface IProject {
    id?: string
    name: string
    description: string
    user_id: string
}

export type Project = {
    project: IProject
}