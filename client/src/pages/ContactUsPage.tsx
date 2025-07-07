// src/pages/ContactUsPage.tsx

import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Mail, Send, Loader2, CheckCircle, LifeBuoy, BookOpen } from 'lucide-react';
import * as apiService from '../services/api';

// Hard-coded content for the contact page
const contactConfig = {
  hero: {
    title: "Get in Touch",
    subtitle: "Have a question about our curriculum, pricing, or just want to say hello? We'd love to hear from you.",
  },
  contactPoints: [
    {
      icon: BookOpen,
      title: "Admissions & General Inquiries",
      email: "hello@codenova.com",
      description: "For questions about enrollment and our programs."
    },
    {
      icon: LifeBuoy,
      title: "Student & Technical Support",
      email: "support@codenova.com",
      description: "For help with the platform or your account."
    }
  ],
  form: {
    title: "Send Us a Message"
  }
};

const ContactUsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError(null);
    setFormSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await apiService.sendContactEmail(formData);
      setFormSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to send message. Please try again.";
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <section className="w-full py-20 md:py-28 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <Mail className="h-12 w-12 mx-auto text-sky-400 mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {contactConfig.hero.title}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-300">
            {contactConfig.hero.subtitle}
          </p>
        </div>
      </section>

      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-16 lg:grid-cols-5">
            <div className="lg:col-span-2 space-y-8">
              {contactConfig.contactPoints.map(point => (
                <div key={point.title} className="flex items-start gap-4">
                  <point.icon className="h-8 w-8 text-sky-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{point.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">{point.description}</p>
                    <a href={`mailto:${point.email}`} className="text-sky-600 dark:text-sky-400 font-medium hover:underline">
                      {point.email}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-3">
              <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">{contactConfig.form.title}</CardTitle>
                  <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit} noValidate>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={5} />
                    </div>
                     {formError && <p className="text-sm text-red-500">{formError}</p>}
                     {formSuccess && (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                           <CheckCircle size={18} />
                           <p className="text-sm font-medium">Message sent successfully!</p>
                        </div>
                     )}
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      {/* THIS IS THE CORRECTED LINE */}
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUsPage;