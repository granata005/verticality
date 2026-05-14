export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <main className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Verticality
          </h1>
          <p className="text-xl text-gray-600">
            SEO & paid advertising that compounds — measurable results for growing businesses.
          </p>
        </div>

        <div className="border-t border-gray-100 pt-8">
          <p className="text-sm text-gray-500">
            Get in touch:{" "}
            <a
              href="mailto:hello@verticality.agency"
              className="text-gray-900 font-medium hover:underline"
            >
              hello@verticality.agency
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
