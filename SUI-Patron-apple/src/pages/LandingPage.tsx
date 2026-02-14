import React from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, Zap, Shield, Globe, CheckCircle } from "lucide-react";
import { Button, Card } from "../components/ui/Shared";
import { AuthContext } from "../components/layout/Layout";
import { motion } from "motion/react";

export const LandingPage = () => {
  const { isAuthenticated, login } = React.useContext(AuthContext);

  if (isAuthenticated) {
    return <Navigate to="/explore" replace />;
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative px-4 pt-24 pb-20 sm:pt-32 sm:pb-24 lg:px-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Background Mesh Effect */}
          <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-[var(--brand-primary)] opacity-[0.08] blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-600 opacity-[0.08] blur-[100px] rounded-full" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold tracking-tight text-[var(--text-primary)] sm:text-7xl"
          >
            Support creators. <br />
            <span className="text-[var(--brand-primary)]">
              Own your access.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-lg leading-8 text-[var(--text-secondary)] max-w-2xl mx-auto"
          >
            One payment. Permanent access. No middlemen. Powered by SUI.
            Experience the future of decentralized patronage.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Button
              size="lg"
              onClick={login}
              className="h-14 px-8 text-lg rounded-full"
            >
              Get Started
            </Button>
            <Link to="/explore">
              <Button
                variant="ghost"
                size="lg"
                className="h-14 px-8 text-lg rounded-full"
              >
                Explore Creators <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={Zap}
            title="Gasless Experience"
            description="Sign in with Google. No wallet needed, no gas tokens required to start supporting."
          />
          <FeatureCard
            icon={Shield}
            title="Encrypted Content"
            description="Your content is encrypted with SEAL. Only your paid supporters can decrypt it."
          />
          <FeatureCard
            icon={Globe}
            title="Decentralized"
            description="No middleman can censor or remove your content. You own your audience relationship."
          />
        </div>
      </section>

      {/* How it Works */}
      <section className="border-t border-[var(--border-default)] bg-[var(--bg-raised)]/30 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">
            Three simple steps to support independence.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-[2px] bg-[var(--border-default)] z-0" />

            <Step
              number={1}
              title="Sign In"
              text="Use your Google account. A SUI wallet is created for you automatically."
            />
            <Step
              number={2}
              title="Find Creators"
              text="Browse artists, writers, and builders you love."
            />
            <Step
              number={3}
              title="Pay Once"
              text="Unlock all content permanently with a single transaction."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-default)] py-12 text-center">
        <div className="flex justify-center gap-6 mb-8 text-[var(--text-tertiary)]">
          <span>Built on SUI</span>
          <span>•</span>
          <span>Powered by Walrus</span>
        </div>
        <p className="text-sm text-[var(--text-disabled)]">
          © 2024 SuiPatron MVP. Open Source.
        </p>
      </footer>
    </div>
  );
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <Card className="relative overflow-hidden bg-[var(--bg-raised)] p-8 transition-all hover:-translate-y-1 hover:border-[var(--border-hover)] group">
    <div className="absolute top-0 right-0 -mr-8 -mt-8 h-24 w-24 rounded-full bg-[var(--brand-primary)] opacity-5 blur-xl group-hover:opacity-10 transition-opacity" />
    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--brand-primary)]">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-xl font-semibold text-[var(--text-primary)]">
      {title}
    </h3>
    <p className="mt-4 text-[var(--text-secondary)] leading-relaxed">
      {description}
    </p>
  </Card>
);

const Step = ({
  number,
  title,
  text,
}: {
  number: number;
  title: string;
  text: string;
}) => (
  <div className="relative z-10 flex flex-col items-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-base)] border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] text-xl font-bold mb-6 shadow-[0_0_20px_rgba(0,122,255,0.2)]">
      {number}
    </div>
    <h3 className="text-xl font-semibold text-[var(--text-primary)]">
      {title}
    </h3>
    <p className="mt-2 text-[var(--text-secondary)] max-w-xs">{text}</p>
  </div>
);
