import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileCheck,
  Users,
  Clock,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import YandexAdBanner from "../ads/YandexAdBanner";
import TranslationAnnouncement from "../common/TranslationAnnouncement";

export const LandingPage = () => {
  const navigate = useNavigate();

  const permitTypes = [
    {
      title: "Working Permission",
      description: "Required for legal employment in the country",
      icon: FileCheck,
      color: "bg-blue-100 text-blue-700",
      features: [
        "Basic language proficiency",
        "Cultural knowledge",
        "Work regulations",
      ],
    },
    {
      title: "Temporary Residence",
      description: "For those planning to stay for an extended period",
      icon: Clock,
      color: "bg-green-100 text-green-700",
      features: [
        "Advanced language skills",
        "Social system understanding",
        "Legal rights and obligations",
      ],
    },
    {
      title: "Permanent Residence",
      description: "For long-term settlement in the country",
      icon: Users,
      color: "bg-purple-100 text-purple-700",
      features: [
        "Complete language mastery",
        "Deep cultural integration",
        "Civic knowledge",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gray-900 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <div className="mb-8 inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-400 ring-1 ring-inset ring-blue-500/20">
              New Platform Launch
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Master Your Permission Tests
              <span className="block text-blue-400">Pass with Confidence</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Your comprehensive preparation platform for working permission,
              temporary residence, and permanent residence tests. Practice with
              real exam-like questions and track your progress.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Button
                size="lg"
                className="bg-blue-500 hover:bg-blue-600"
                onClick={() => navigate("/register")}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-black hover:text-white border-white/20 hover:bg-white/10"
                onClick={() => navigate("/demo")}
              >
                Try Demo Test
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Ad Banner Section */}
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* <YandexAdBanner /> */}
      </div>

      {/* Quick Stats */}
      <div className="relative -mt-10 lg:-mt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-lg grid-cols-1 gap-6 sm:grid-cols-3 lg:mx-0 lg:max-w-none">
            {[
              { stat: "95%", label: "Pass Rate" },
              { stat: "10k+", label: "Practice Questions" },
              { stat: "24/7", label: "Study Access" },
            ].map((item) => (
              <Card
                key={item.label}
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
              >
                <CardContent className="p-6">
                  <p className="text-3xl font-bold text-blue-600">
                    {item.stat}
                  </p>
                  <p className="text-sm text-gray-600">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Permit Types Section */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Choose Your Permission Path
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Select the permission type you're preparing for and begin your
              journey to success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {permitTypes.map((permit) => {
              const Icon = permit.icon;
              return (
                <Card
                  key={permit.title}
                  className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 group-hover:translate-x-0 -translate-x-full transition-transform duration-300" />
                  <CardHeader>
                    <div
                      className={`${permit.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">{permit.title}</CardTitle>
                    <CardDescription>{permit.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {permit.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose Our Platform
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to succeed in your permission tests
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: GraduationCap,
                title: "Comprehensive Content",
                description:
                  "Cover all required topics with our extensive question bank",
              },
              {
                icon: Clock,
                title: "Practice at Your Pace",
                description:
                  "Flexible learning with timed and untimed practice modes",
              },
              {
                icon: Users,
                title: "Real Exam Simulation",
                description:
                  "Experience tests in conditions similar to the actual exam",
              },
              {
                icon: FileCheck,
                title: "Track Progress",
                description:
                  "Monitor your improvement with detailed statistics",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative isolate overflow-hidden bg-gray-900">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Begin Your Journey?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
              Start practicing now and take the first step towards achieving
              your residency goals.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                size="lg"
                className="bg-blue-500 hover:bg-blue-600"
                onClick={() => navigate("/register")}
              >
                Create Account
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-black hover:text-white border-white/20 hover:bg-white/10"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
        <svg
          viewBox="0 0 1024 1024"
          className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
          aria-hidden="true"
        >
          <circle
            cx="512"
            cy="512"
            r="512"
            fill="url(#gradient)"
            fillOpacity="0.7"
          />
          <defs>
            <radialGradient id="gradient">
              <stop stopColor="#3B82F6" />
              <stop offset="1" stopColor="#1E40AF" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <TranslationAnnouncement />
    </div>
  );
};

export default LandingPage;
