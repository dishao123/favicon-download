"use client";

import { Markdown } from "@/components/shared/markdown";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { appConfig } from "@/config";
import apiClient from "@/lib/api";
import { cn, isBrowser } from "@/lib/utils";
import { ResponseInfo } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Faqs } from "../../shared/faqs";
import ImageCode from "../../shared/image-code";
import { Results } from "./results";

// Regular expression to validate a domain name
const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;

const FormValueSchema = z.object({
  domain: z.string().regex(domainRegex, "Invalid domain name")
}); 
type FormValues = z.infer<typeof FormValueSchema>;

export function Main({
  markdownContents
}: Readonly<{  
  markdownContents: Record<string, string | undefined>;
}>) {
  const { block1 } = markdownContents;
  const t = useTranslations();
  const [fetching, setFetching] = useState<boolean>(false);
  const [error, setError] = useState<any>(false); 
  const [info, setInfo] = useState<ResponseInfo | null>(null); 
  const defaultValues: FormValues = { 
    domain: "openai.com"  
  }
  const [values, setValues] = useState<FormValues>(defaultValues); 

  const form = useForm<FormValues>({
    resolver: zodResolver(FormValueSchema),
    defaultValues
  });

  const faqs = [
    {
      question: t('frontend.home.faq.qa1.question'),
      answer: t('frontend.home.faq.qa1.answer')
    },
    {
      question: t('frontend.home.faq.qa2.question'),
      answer: t('frontend.home.faq.qa2.answer')
    },
    {
      question: t('frontend.home.faq.qa3.question'),
      answer: t('frontend.home.faq.qa3.answer')
    },
    {
      question: t('frontend.home.faq.qa4.question'),
      answer: t('frontend.home.faq.qa4.answer')
    },
    {
      question: t('frontend.home.faq.qa5.question'),
      answer: t('frontend.home.faq.qa5.answer')
    },
  ];

  const { domain } = values;

  const handleSubmit = (values: FormValues) => {
    setFetching(true);
    setError(false); 
    setInfo(null); 
    setValues(values);
    apiClient.get(`/${values.domain}`)
      .then((res) => { 
        setInfo(res as any);
        setFetching(false);
      })
      .catch((error) => {
        setError(error.message);
        console.log("error", error);
        setFetching(false);
      });
  };

  const textCls = "text-primary font-medium";
  const [host, setHost] = useState<string | undefined>(undefined);
  const [imageDefaultUrl, setImageDefaultUrl] = useState<string | undefined>(undefined);
  const [imageLargerUrl, setImageLargerUrl] = useState<string | undefined>(undefined);
 
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentHost = window.location.host;
      const protocol = window.location.protocol; 
      setHost(currentHost); 
      setImageDefaultUrl(`${protocol}//${currentHost}/${domain}`);
      setImageLargerUrl(`${protocol}//${currentHost}/${domain}?larger=true`);
    }
  }, [domain]);

  const imageDefaultCoce = imageDefaultUrl ? `<img alt="Favicon" src="${imageDefaultUrl}" />` : "";
  const imageLargerCoce = imageLargerUrl ? `<img alt="Favicon" src="${imageLargerUrl}" />` : "";

  const images: {
    src: string;
    title: string;
    codeStr: string;
    alt: string;
  }[] = [
    {
      src: imageDefaultUrl || "",
      title: t("frontend.home.default_size"),
      codeStr: imageDefaultCoce,
      alt: t("frontend.home.default_size_alt", { domain })
    },
    {
      src: imageLargerUrl || "",
      title: t("frontend.home.larger_size"),
      codeStr: imageLargerCoce,
      alt: t("frontend.home.larger_size_alt", { domain })
    },
  ]; 

  return (
    <div className={cn("max-w-4xl mx-auto w-full leading-9 text-base")}> 
      <h1 className="text-4xl mb-2 font-extrabold">{appConfig.appName}</h1>
      <p className={`${textCls} border-l-8 border-primary/60 pl-4 font-semibold`}>{t('frontend.home.h1')}</p>
      <h2 className="text-2xl flex items-center mt-10 font-semibold">
        {t('frontend.home.sub_to_h1')} 
      </h2> 
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full">
          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem nospace={true} className="mt-5 mb-8"> 
                <div className="flex w-full">
                  <FormControl>
                    <Input type="search" className="rounded-s-md h-13 text-xl aria-[describedby*=-form-item-message]:ring-red-400" placeholder="Enter Domain (e.g., example.com)" {...field} />
                  </FormControl>
                  <Button loading={fetching} className="h-13 rounded-e-md" disabled={!field.value || fetching}>{t('frontend.home.get_favicons')}</Button>
                </div>  
                {field.value && <FormMessage /> }
              </FormItem>
            )}
          />
        </form>
      </Form>
      {error && <div className="rounded-md border border-red-500 p-10 mb-10">{error}</div>}
      {fetching && <Skeleton className="h-72 w-full rounded-md mb-8" />}  
      {info && isBrowser() && <Results info={info} />}  
      {host && images.map(image => <ImageCode {...image} key={image.src} />)} 
      {block1 && <Markdown content={block1} className="mt-10" />}
      <Faqs faqs={faqs} title={t('frontend.home.faq.title')} />
    </div>
  );
}
