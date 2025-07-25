import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Form } from "./form";
import { AuthenticateFormData } from "../../features/authenticate/authenticateForm";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";

export type PageError = {
  title: string;
  description: string;
};

type Props = {
  pageError?: PageError;
  handleSubmit: (data: AuthenticateFormData) => void;
};

export default function LoginPage({ handleSubmit, pageError }: Props) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="flex w-full max-w-md flex-col">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">ログイン</CardTitle>
          {pageError && (
            <Alert variant="destructive">
              <AlertTitle>{pageError.title}</AlertTitle>
              <AlertDescription>{pageError.description}</AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <Form handleSubmit={handleSubmit} />
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t pt-6">
          <div className="text-muted-foreground text-center text-sm">
            アカウントをお持ちでないですか？{" "}
            <a
              href="/signup"
              className="text-primary hover:text-primary/90 underline"
            >
              アカウント作成
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
