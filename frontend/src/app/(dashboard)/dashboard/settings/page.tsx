"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Mail,
  Moon,
  Sun,
  User,
  Shield,
  Globe,
  Smartphone,
  Check,
} from "lucide-react";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { SubscriptionSection } from "@/components/dashboard/subscription-section";

interface SettingItem {
  id: string;
  type: "input" | "switch";
  label: string;
  value?: string;
  checked?: boolean;
}

interface SettingSection {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  items: SettingItem[];
}

export default function SettingsPage() {
  const [sections, setSections] = useState<SettingSection[]>([
    {
      id: "profile",
      title: "Perfil",
      icon: User,
      description: "Administra tu información personal y preferencias",
      items: [
        {
          id: "name",
          type: "input",
          label: "Nombre",
          value: "Juan Pérez",
        },
        {
          id: "email",
          type: "input",
          label: "Email",
          value: "juan@ejemplo.com",
        },
      ],
    },
    {
      id: "notifications",
      title: "Notificaciones",
      icon: Bell,
      description: "Configura cómo y cuándo quieres recibir notificaciones",
      items: [
        {
          id: "email_notifications",
          type: "switch",
          label: "Notificaciones por email",
          checked: true,
        },
        {
          id: "push_notifications",
          type: "switch",
          label: "Notificaciones push",
          checked: true,
        },
        {
          id: "weekly_summary",
          type: "switch",
          label: "Resumen semanal",
          checked: false,
        },
      ],
    },
    {
      id: "privacy",
      title: "Privacidad",
      icon: Shield,
      description: "Controla tu privacidad y seguridad",
      items: [
        {
          id: "public_profile",
          type: "switch",
          label: "Perfil público",
          checked: false,
        },
        {
          id: "share_progress",
          type: "switch",
          label: "Compartir progreso",
          checked: true,
        },
      ],
    },
  ]);

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (sectionId: string, itemId: string, value: string) => {
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === sectionId 
          ? {
              ...section,
              items: section.items.map(item => 
                item.id === itemId 
                  ? { ...item, value } 
                  : item
              )
            }
          : section
      )
    );
  };

  const handleSwitchChange = (sectionId: string, itemId: string, checked: boolean) => {
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === sectionId 
          ? {
              ...section,
              items: section.items.map(item => 
                item.id === itemId 
                  ? { ...item, checked } 
                  : item
              )
            }
          : section
      )
    );
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    
    // Simulación de guardado en el servidor
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulación de envío de correo electrónico
    const emailNotificationsEnabled = sections
      .find(section => section.id === "notifications")
      ?.items.find(item => item.id === "email_notifications")
      ?.checked;
    
    if (emailNotificationsEnabled) {
      console.log("Enviando correo de notificación a:", 
        sections.find(section => section.id === "profile")
          ?.items.find(item => item.id === "email")?.value
      );
    }
    
    setIsSaving(false);
    setShowSuccessDialog(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1
          className="text-3xl font-bold tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Configuración
        </motion.h1>
        <motion.p
          className="text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Personaliza tu experiencia en SoulDream
        </motion.p>
      </div>

      {/* Subscription Section */}
      <SubscriptionSection />

      {/* Settings Sections */}
      <div className="grid gap-6">
        {sections.map((section, sectionIndex) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + sectionIndex * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-soul-purple to-soul-blue flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.id}
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.3 + sectionIndex * 0.1 + itemIndex * 0.1,
                    }}
                  >
                    <Label htmlFor={item.id}>{item.label}</Label>
                    {item.type === "input" ? (
                      <Input
                        id={item.id}
                        value={item.value}
                        onChange={(e) => handleInputChange(section.id, item.id, e.target.value)}
                        className="max-w-[300px]"
                      />
                    ) : (
                      <Switch 
                        id={item.id} 
                        checked={item.checked}
                        onCheckedChange={(checked) => handleSwitchChange(section.id, item.id, checked)}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}

        {/* Theme Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-soul-purple to-soul-blue flex items-center justify-center">
                <Moon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Tema</h2>
                <p className="text-sm text-muted-foreground">
                  Personaliza la apariencia de la aplicación
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Modo de color</Label>
              <ModeToggle />
            </div>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button 
            onClick={handleSaveChanges} 
            disabled={isSaving}
            className="min-w-[150px]"
          >
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </motion.div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Cambios guardados
            </DialogTitle>
            <DialogDescription>
              Tus cambios han sido guardados correctamente.
              {sections.find(section => section.id === "notifications")
                ?.items.find(item => item.id === "email_notifications")
                ?.checked && (
                <span className="block mt-2">
                  Se ha enviado una notificación a tu correo electrónico.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setShowSuccessDialog(false)}>
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 