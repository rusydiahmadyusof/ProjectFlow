'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const LandingPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleGetStarted = () => {
    router.push('/signup');
  };

  const features = [
    {
      icon: 'view_kanban',
      title: 'Project Management',
      description: 'Organize and track all your projects in one place with intuitive kanban boards and progress tracking.',
    },
    {
      icon: 'check_box',
      title: 'Task Tracking',
      description: 'Create, assign, and manage tasks with due dates, priorities, and real-time collaboration.',
    },
    {
      icon: 'group',
      title: 'Team Collaboration',
      description: 'Work seamlessly with your team members, assign roles, and keep everyone in sync.',
    },
    {
      icon: 'analytics',
      title: 'Analytics & Insights',
      description: 'Get detailed insights into project progress, team performance, and completion rates.',
    },
    {
      icon: 'notifications',
      title: 'Smart Notifications',
      description: 'Stay updated with real-time notifications for assignments, deadlines, and team activities.',
    },
    {
      icon: 'security',
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security and role-based access control.',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '50K+', label: 'Projects Managed' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-primary aspect-square rounded-full size-10 flex items-center justify-center text-white font-bold text-xl">
                P
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">ProjectFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
              >
                Sign In
              </Link>
              <button
                onClick={handleGetStarted}
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-md shadow-blue-500/20"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
              Manage Projects
              <br />
              <span className="text-primary">Efficiently</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
              The all-in-one project management platform that helps teams collaborate, track progress, and deliver results faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-lg text-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>Start Free Trial</span>
                <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
              </button>
              <Link
                href="/login"
                className="w-full sm:w-auto bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-primary text-slate-900 dark:text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[24px]">play_circle</span>
                <span>Watch Demo</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl text-primary mb-4">dashboard</span>
                  <p className="text-slate-600 dark:text-slate-400">Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful features to help you manage projects, collaborate with your team, and achieve your goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700 hover:border-primary/50"
              >
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-[28px]">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of teams already using ProjectFlow to manage their projects.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white hover:bg-slate-50 text-primary font-bold px-8 py-4 rounded-lg text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 mx-auto"
          >
            <span>Create Free Account</span>
            <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary aspect-square rounded-full size-8 flex items-center justify-center text-white font-bold">
                  P
                </div>
                <span className="text-white font-bold">ProjectFlow</span>
              </div>
              <p className="text-sm">Manage projects efficiently with the all-in-one platform.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#features" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#security" className="hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#blog" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#careers" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} ProjectFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
