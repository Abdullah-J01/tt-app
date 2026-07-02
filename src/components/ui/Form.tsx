"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  useForm,
  type FieldValues,
  type Resolver,
  type SubmitHandler,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { z } from "zod";

/**
 * Create a typed React Hook Form instance wired to a Zod schema. Field values,
 * `register` keys and `errors` are all inferred from the schema, so a form is
 * defined by its Zod schema alone.
 *
 * @example
 * const form = useZodForm(loginSchema);
 * <Form form={form} onSubmit={(values) => ...}>...</Form>
 */
export function useZodForm<TSchema extends z.ZodType<FieldValues, FieldValues>>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.input<TSchema>>, "resolver">,
): UseFormReturn<z.input<TSchema>> {
  return useForm<z.input<TSchema>>({
    // Validate on blur, then keep re-validating as the user fixes the field.
    mode: "onBlur",
    ...options,
    resolver: zodResolver(schema) as Resolver<z.input<TSchema>>,
  });
}

interface FormProps<TFieldValues extends FieldValues> extends Omit<
  ComponentPropsWithoutRef<"form">,
  "onSubmit"
> {
  /** The instance returned by `useZodForm` (or React Hook Form's `useForm`). */
  form: UseFormReturn<TFieldValues>;
  /** Called with parsed, valid values when the form passes validation. */
  onSubmit: SubmitHandler<TFieldValues>;
  children: ReactNode;
}

/**
 * Thin `<form>` wrapper that provides the RHF context (so nested fields can call
 * `useFormContext`) and gates submission behind validation. Native browser
 * validation is disabled so Zod is the single source of truth.
 */
export function Form<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  ...props
}: FormProps<TFieldValues>) {
  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} {...props}>
        {children}
      </form>
    </FormProvider>
  );
}
