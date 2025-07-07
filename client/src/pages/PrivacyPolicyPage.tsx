// src/pages/PrivacyPolicyPage.tsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();
  const effectiveDate = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-slate-800 dark:text-slate-300">

          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
              aria-label="Go back to previous page"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-4 text-center">
            Privacy Policy
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-12">
            Last Updated: {effectiveDate}
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 leading-relaxed">
            <p>
              <strong>CodeNova</strong> ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services (collectively, the "Service"). Please read this policy carefully.
            </p>
            
            <h2 id="collection">1. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
            <ul>
                <li>
                    <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and password, that you voluntarily give to us when you register for an account.
                </li>
                <li>
                    <strong>Derivative Data:</strong> Information our servers automatically collect, such as your IP address, browser type, and the pages you have viewed on our site.
                </li>
                <li>
                    <strong>Financial Data:</strong> We use third-party payment processors (e.g., Stripe, PayPal, Chapa). We do not store or collect your payment card details. That information is provided directly to our third-party payment processors.
                </li>
                <li>
                    <strong>User Progress Data:</strong> Information related to your progress through our curriculum, including completed lessons, submitted projects, and quiz scores.
                </li>
            </ul>

            <h2 id="use-of-info">2. Use of Your Information</h2>
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:</p>
            <ul>
                <li>Create and manage your account.</li>
                <li>Deliver the curriculum and track your learning progress.</li>
                <li>Process payments and subscriptions.</li>
                <li>Email you regarding your account or order.</li>
                <li>Monitor and analyze usage and trends to improve your experience with the Service.</li>
                <li>Provide you with user support and respond to your inquiries.</li>
            </ul>

            <h2 id="disclosure">3. Disclosure of Your Information</h2>
            <p>We do not sell, trade, or rent your personal identification information to others. We may share information we have collected about you in certain situations:</p>
            <ul>
                <li>
                    <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.
                </li>
                <li>
                    <strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, and hosting services.
                </li>
            </ul>

            <h2 id="security">4. Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
            </p>

            <h2 id="rights">5. Your Rights</h2>
            <p>
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul>
                <li>The right to access – You have the right to request copies of your personal data.</li>
                <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate.</li>
                <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
            </ul>
            <p>To exercise these rights, please contact us using the contact information provided below.</p>
            
            <h2 id="policy-for-children">6. Policy for Children</h2>
            <p>
              We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us.
            </p>

            <h2 id="changes">7. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>

            <h2 id="contact">8. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@codenova.com">privacy@codenova.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;