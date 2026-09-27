import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { Modal } from '../ui/Modal';
import { NewInvestigationForm } from '../investigation/NewInvestigationForm';

export const AppShell: React.FC = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewInvestigationOpen, setIsNewInvestigationOpen] = useState(false);
  const navigate = useNavigate();

  const handleCreated = (id: string) => {
    setIsNewInvestigationOpen(false);
    navigate(`/investigations/${id}`);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-console-text font-sans">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Topbar
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onNewInvestigation={() => setIsNewInvestigationOpen(true)}
        />

        {/* Scrollable Page Outlet */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNewInvestigation={() => setIsNewInvestigationOpen(true)}
      />

      {/* Global New Investigation Modal */}
      <Modal
        isOpen={isNewInvestigationOpen}
        onClose={() => setIsNewInvestigationOpen(false)}
        title="Start New Investigation"
        subtitle="AI-driven multi-agent root cause analysis, fix proposal, and test verification"
        maxWidth="2xl"
      >
        <NewInvestigationForm
          onSuccess={handleCreated}
          onCancel={() => setIsNewInvestigationOpen(false)}
        />
      </Modal>
    </div>
  );
};
