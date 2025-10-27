import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-foreground">
          <p>
            Your privacy is important to us. This policy explains how SmartChat
            AI collects, uses, and protects your information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              We collect your email, name, and profile image for authentication
              and personalization.
            </li>
            <li>Your data is never sold to third parties.</li>
            <li>
              We use cookies and similar technologies to improve your
              experience.
            </li>
            <li>
              We may use anonymized data to improve our AI models and services.
            </li>
            <li>
              You can request deletion of your account and data at any time by
              contacting support@smartchatai.com.
            </li>
            <li>
              We implement security measures to protect your information, but
              cannot guarantee absolute security.
            </li>
            <li>
              This policy may be updated. Continued use of the service means you
              accept the new policy.
            </li>
          </ul>
          <p>
            For questions or concerns, contact us at support@smartchatai.com.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
