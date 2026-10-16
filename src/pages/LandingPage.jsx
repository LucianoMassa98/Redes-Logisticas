import React, { useState } from 'react';
import { Navbar } from '../components/common/Navbar.jsx';
import { Hero } from '../components/landing/Hero.jsx';
import { ServicesCatalog } from '../components/landing/ServicesCatalog.jsx';
import { TargetClients } from '../components/landing/TargetClients.jsx';
import { LeadCaptureForm } from '../components/landing/LeadCaptureForm.jsx';
import { BenefitsSection } from '../components/landing/BenefitsSection.jsx';
import { ProcessSection } from '../components/landing/ProcessSection.jsx';
import { FaqSection } from '../components/landing/FaqSection.jsx';
import { CtaBanner } from '../components/landing/CtaBanner.jsx';
import { Footer } from '../components/common/Footer.jsx';
import { PrivacyPolicyModal } from '../components/common/PrivacyPolicyModal.jsx';

export const LandingPage = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  const handleSelectServiceFromCatalog = (serviceCode) => {
    setSelectedService(serviceCode);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-brand-500 selection:text-white">
      {/* Header público */}
      <Navbar />

      <main className="flex-1">
        {/* Hero Principal */}
        <Hero />

        {/* Catálogo de los 5 Servicios */}
        <ServicesCatalog onSelectService={handleSelectServiceFromCatalog} />

        {/* Sección de Clientes Objetivo */}
        <TargetClients />

        {/* Formulario Principal de Captación de Leads */}
        <LeadCaptureForm
          preselectedService={selectedService}
          onOpenPrivacy={() => setPrivacyModalOpen(true)}
        />

        {/* Beneficios */}
        <BenefitsSection />

        {/* Proceso en 4 Pasos */}
        <ProcessSection />

        {/* Preguntas Frecuentes */}
        <FaqSection />

        {/* Banner CTA Final */}
        <CtaBanner />
      </main>

      {/* Footer comercial con datos configurables */}
      <Footer onOpenPrivacy={() => setPrivacyModalOpen(true)} />

      {/* Modal de Política de Privacidad */}
      <PrivacyPolicyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />
    </div>
  );
};
