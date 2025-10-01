import React from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">{t("privacy.title")}</h1>
        <p className="text-gray-600">{t("privacy.lastUpdated")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("privacy.intro.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{t("privacy.intro.content")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("privacy.dataCollection.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">{t("privacy.dataCollection.intro")}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>{t("privacy.dataCollection.items.personal")}</li>
            <li>{t("privacy.dataCollection.items.account")}</li>
            <li>{t("privacy.dataCollection.items.test")}</li>
            <li>{t("privacy.dataCollection.items.usage")}</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("privacy.dataUse.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">{t("privacy.dataUse.intro")}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>{t("privacy.dataUse.items.service")}</li>
            <li>{t("privacy.dataUse.items.improve")}</li>
            <li>{t("privacy.dataUse.items.personalize")}</li>
            <li>{t("privacy.dataUse.items.communicate")}</li>
            <li>{t("privacy.dataUse.items.analytics")}</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("privacy.dataProtection.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{t("privacy.dataProtection.content")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("privacy.cookies.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{t("privacy.cookies.content")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("privacy.thirdParty.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">{t("privacy.thirdParty.intro")}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>{t("privacy.thirdParty.items.yandex")}</li>
            <li>{t("privacy.thirdParty.items.payment")}</li>
            <li>{t("privacy.thirdParty.items.analytics")}</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("privacy.rights.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">{t("privacy.rights.intro")}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>{t("privacy.rights.items.access")}</li>
            <li>{t("privacy.rights.items.correct")}</li>
            <li>{t("privacy.rights.items.delete")}</li>
            <li>{t("privacy.rights.items.export")}</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("privacy.children.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{t("privacy.children.content")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("privacy.changes.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{t("privacy.changes.content")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("privacy.contact.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{t("privacy.contact.content")}</p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="font-semibold text-blue-900">
              {t("privacy.contact.location")}
            </p>
            <p className="text-gray-700">
              Test My Russian
              <br />
              {t("privacy.contact.city")}
              <br />
              {t("privacy.contact.country")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
