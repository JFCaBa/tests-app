import React from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Globe, Mail, Languages } from "lucide-react";

export const Contact = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">{t("contact.title")}</h1>
        <p className="text-gray-600">{t("contact.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {t("contact.location.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-semibold">Test My Russian</p>
            <p className="text-gray-600">{t("contact.location.city")}</p>
            <p className="text-gray-600">{t("contact.location.country")}</p>
            <p className="text-sm text-gray-500 mt-4">
              {t("contact.location.description")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-green-600" />
              {t("contact.languages.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-3">
              {t("contact.languages.description")}
            </p>
            <ul className="grid grid-cols-2 gap-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                English
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Русский (Russian)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                O'zbek (Uzbek)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Тоҷикӣ (Tajik)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Español (Spanish)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                हिन्दी (Hindi)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                اردو (Urdu)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                中文 (Chinese)
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-600" />
              {t("contact.service.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{t("contact.service.description")}</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>• Work permits in Russia</li>
              <li>• Temporary residence permits</li>
              <li>• Permanent residence (VNZh)</li>
              <li>• Citizenship applications</li>
              <li>• Professional development</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-orange-600" />
              {t("contact.about.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{t("contact.about.description")}</p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-blue-900">
                {t("contact.website")}:
              </p>
              <a
                href="https://testmyrussian.com"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://testmyrussian.com
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Structured Data for this page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            mainEntity: {
              "@type": "EducationalOrganization",
              name: "Test My Russian",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Saint Petersburg",
                addressRegion: "Saint Petersburg",
                addressCountry: "RU",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: "59.9343",
                longitude: "30.3351",
              },
              areaServed: {
                "@type": "Country",
                name: "Russia",
              },
            },
          }),
        }}
      />
    </div>
  );
};

export default Contact;
