import React from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const TermsConditions = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">{t("terms.title")}</h1>
        <p className="text-gray-600">{t("terms.lastUpdated")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("terms.acceptance.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{t("terms.acceptance.content")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("terms.services.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">{t("terms.services.intro")}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>{t("terms.services.items.tests")}</li>
            <li>{t("terms.services.items.practice")}</li>
            <li>{t("terms.services.items.tutoring")}</li>
            <li>{t("terms.services.items.coaching")}</li>
            <li>{t("terms.services.items.flashcards")}</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("terms.accounts.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">{t("terms.accounts.intro")}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>{t("terms.accounts.items.accurate")}</li>
            <li>{t("terms.accounts.items.secure")}</li>
            <li>{t("terms.accounts.items.responsible")}</li>
            <li>{t("terms.accounts.items.notify")}</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("terms.usage.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">{t("terms.usage.intro")}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>{t("terms.usage.prohibited.violate")}</li>
            <li>{t("terms.usage.prohibited.hack")}</li>
            <li>{t("terms.usage.prohibited.spam")}</li>
            <li>{t("terms.usage.prohibited.impersonate")}</li>
            <li>{t("terms.usage.prohibited.share")}</li>
            <li>{t("terms.usage.prohibited.scrape")}</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("terms.intellectual.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{t("terms.intellectual.content")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("terms.payments.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">{t("terms.payments.intro")}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>{t("terms.payments.items.pricing")}</li>
            <li>{t("terms.payments.items.billing")}</li>
            <li>{t("terms.payments.items.refunds")}</li>
            <li>{t("terms.payments.items.cancellation")}</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("terms.disclaimer.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 font-semibold">
            {t("terms.disclaimer.content")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("terms.limitation.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{t("terms.limitation.content")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("terms.termination.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{t("terms.termination.content")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("terms.governing.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{t("terms.governing.content")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("terms.changes.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{t("terms.changes.content")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("terms.contact.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{t("terms.contact.content")}</p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="font-semibold text-blue-900">
              {t("terms.contact.location")}
            </p>
            <p className="text-gray-700">
              Test My Russian
              <br />
              {t("terms.contact.city")}
              <br />
              {t("terms.contact.country")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsConditions;
