import Link from "next/link";

export default function Header() {
  return (
    <section className="bg-gray-50 dark:bg-gray-700">
      <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:h-screen lg:items-center">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-extrabold sm:text-5xl">
            Music Production AI
            <strong className="font-extrabold text-blue-700 sm:block"> by Music Producers. </strong>
          </h1>

          <p className="mt-4 sm:text-xl/relaxed">
            Generate loops and samples that sound just like you with a few easy steps.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              className="block w-full rounded-md bg-blue-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring active:bg-blue-500 sm:w-auto"
              href="/sign-up"
            >
              Get Started
            </Link>

            <Link
              className="block w-full rounded-md px-12 py-3 text-sm font-medium text-blue-600 shadow hover:text-blue-700 focus:outline-none focus:ring active:text-blue-500 sm:w-auto"
              href="/about"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
