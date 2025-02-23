import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Manage your influencer campaigns with ease
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Streamline your campaign creation, management, and analysis all in one place.
              Built for brands who want to scale their influencer marketing efforts.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/api/auth/login"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get started
              </Link>
              <Link
                href="/api/auth/login"
                className="text-sm font-semibold leading-6 text-gray-900 flex items-center"
              >
                Learn more <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">
            Campaign Management
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to run successful campaigns
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    name: 'Campaign Creation',
    description: 'Create and manage campaigns with our intuitive wizard interface. Set objectives, target audience, and creative requirements.',
    icon: ArrowRightIcon,
  },
  {
    name: 'Asset Management',
    description: 'Upload, organize, and review creative assets. Collaborate with influencers and team members efficiently.',
    icon: ArrowRightIcon,
  },
  {
    name: 'Analytics & Reporting',
    description: 'Track campaign performance, measure ROI, and generate comprehensive reports for stakeholders.',
    icon: ArrowRightIcon,
  },
];
