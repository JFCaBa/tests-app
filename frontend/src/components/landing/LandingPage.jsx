import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
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

import { useAuth } from "@/contexts/AuthContext";
import SEOHead from "../SEOHead";

export const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { loginAsGuest, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/subjects");
    }
  }, [isAuthenticated, navigate]);

  const permitTypes = [
    {
      title: t("landing.permits.types.working.title"),
      description: t("landing.permits.types.working.description"),
      icon: FileCheck,
      color: "bg-blue-100 text-blue-700",
      features: t("landing.permits.types.working.features", {
        returnObjects: true,
      }),
    },
    {
      title: t("landing.permits.types.temporary.title"),
      description: t("landing.permits.types.temporary.description"),
      icon: Clock,
      color: "bg-green-100 text-green-700",
      features: t("landing.permits.types.temporary.features", {
        returnObjects: true,
      }),
    },
    {
      title: t("landing.permits.types.permanent.title"),
      description: t("landing.permits.types.permanent.description"),
      icon: Users,
      color: "bg-purple-100 text-purple-700",
      features: t("landing.permits.types.permanent.features", {
        returnObjects: true,
      }),
    },
  ];

  const stats = [
    { stat: t("landing.stats.stats.95%"), label: t("landing.stats.passRate") },
    {
      stat: t("landing.stats.stats.10k+"),
      label: t("landing.stats.practiceQuestions"),
    },
    {
      stat: t("landing.stats.stats.24/7"),
      label: t("landing.stats.studyAccess"),
    },
  ];

  const features = [
    {
      icon: GraduationCap,
      title: t("landing.features.list.content.title"),
      description: t("landing.features.list.content.description"),
    },
    {
      icon: Clock,
      title: t("landing.features.list.practice.title"),
      description: t("landing.features.list.practice.description"),
    },
    {
      icon: Users,
      title: t("landing.features.list.simulation.title"),
      description: t("landing.features.list.simulation.description"),
    },
    {
      icon: FileCheck,
      title: t("landing.features.list.progress.title"),
      description: t("landing.features.list.progress.description"),
    },
  ];

  return (
    <>
      <SEOHead 
        title="Test My Russian - Master Russian Language Skills" 
        description="Interactive platform for Russian language learning with practice tests, tutoring, and AI coaching." 
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gray-900 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <div className="mb-8 inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-400 ring-1 ring-inset ring-blue-500/20">
              {t("landing.hero.newPlatform")}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              {t("landing.hero.title")}
              <span className="block text-blue-400">
                {t("landing.hero.subtitle")}
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              {t("landing.hero.description")}
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Button
                size="lg"
                className="bg-blue-500 hover:bg-blue-600"
                onClick={() => navigate("/login")}
              >
                {t("landing.hero.getStarted")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-black hover:text-white border-white/20 hover:bg-white/10"
                onClick={async () => {
                  await loginAsGuest();
                  navigate("/subjects");
                }}
              >
                {t("landing.hero.tryDemo")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="relative -mt-10 lg:-mt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-lg grid-cols-1 gap-6 sm:grid-cols-3 lg:mx-0 lg:max-w-none">
            {stats.map((item) => (
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
              {t("landing.permits.title")}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t("landing.permits.subtitle")}
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
              {t("landing.features.title")}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t("landing.features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
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
              {t("landing.cta.title")}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
              {t("landing.cta.subtitle")}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                size="lg"
                className="bg-blue-500 hover:bg-blue-600"
                onClick={() => navigate("/register")}
              >
                {t("landing.cta.createAccount")}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-black hover:text-white border-white/20 hover:bg-white/10"
                onClick={() => navigate("/login")}
              >
                {t("landing.cta.signIn")}
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

      {/* Contextual Links Section */}
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 text-center">
          <p className="text-gray-700">
            Planning to visit Russia or other countries?{" "}
            <a
              href="https://localguideapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-semibold underline"
            >
              Discover LocalGuideApp
            </a>
            {" "}— AI-powered tours and local guides worldwide.
          </p>
        </div>
      </div>

      {/* Ad Banner Section */}
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <YandexAdBanner />
      </div>
    </div>
  </>
  );
};

export default LandingPage;

LandingPage.propTypes = {};

