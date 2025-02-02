import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AssignSponsorDialog } from "@/components/AssistantSponsorship/AssignSponsorDialog";

export default function SponsorshipManagement() {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);
  const [isAddingSponsor, setIsAddingSponsor] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [newSponsorForm, setNewSponsorForm] = useState({
    name: "",
    email: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password_hash: "",
  });

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .order("name");

      if (error) throw error;
      setSponsors(data || []);
    } catch (error) {
      console.error("Error fetching sponsors:", error);
      toast.error("Erreur lors du chargement des parrains");
    }
  };

  const handleEdit = (sponsor: any) => {
    setEditingSponsorId(sponsor.id);
    setEditForm({
      name: sponsor.name,
      email: sponsor.email,
      password_hash: sponsor.password_hash || "",
    });
  };

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from("sponsors")
        .update({
          name: editForm.name,
          email: editForm.email,
          password_hash: editForm.password_hash,
        })
        .eq("id", editingSponsorId);

      if (error) throw error;

      toast.success("Parrain mis à jour avec succès");
      setEditingSponsorId(null);
      fetchSponsors();
    } catch (error) {
      console.error("Error updating sponsor:", error);
      toast.error("Erreur lors de la mise à jour du parrain");
    }
  };

  const handleAddSponsor = async () => {
    try {
      // Create new sponsor
      const { data: sponsorData, error: sponsorError } = await supabase
        .from("sponsors")
        .insert({
          name: newSponsorForm.name,
          email: newSponsorForm.email,
          password_hash: "Touspourcuba1", // Default password
          role: "sponsor",
          is_active: true
        })
        .select()
        .single();

      if (sponsorError) throw sponsorError;

      toast.success("Parrain créé avec succès");
      setIsAddingSponsor(false);
      setNewSponsorForm({ name: "", email: "" });
      
      // If a child was selected, open the assignment dialog
      if (sponsorData) {
        setSelectedChildId(sponsorData.id);
      }

      fetchSponsors();
    } catch (error) {
      console.error("Error creating sponsor:", error);
      toast.error("Erreur lors de la création du parrain");
    }
  };

  const filterBySearch = (data: any[]) => {
    return data.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const sortData = (data: any[]) => {
    return [...data].sort((a, b) => {
      if (!a.name) return 1;
      if (!b.name) return -1;
      return a.name.localeCompare(b.name);
    });
  };

  return (
    <Card className="w-full p-2 md:p-4 space-y-4 rounded-none sm:rounded-lg">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-4">Gestion des Parrains</h1>
        <Button onClick={() => setIsAddingSponsor(true)}>
          Ajouter un parrain
        </Button>
      </div>
      
      <div className="relative mb-6">
        <Input
          type="search"
          placeholder="Rechercher un parrain..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <ScrollArea className="w-full overflow-auto">
        <div className="rounded-md border min-w-[800px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Nom</TableHead>
                <TableHead className="min-w-[200px]">Email</TableHead>
                <TableHead className="min-w-[200px]">Mot de passe</TableHead>
                <TableHead className="min-w-[200px]">Dernière connexion</TableHead>
                <TableHead className="min-w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortData(filterBySearch(sponsors || [])).map((sponsor) => (
                <React.Fragment key={sponsor.id}>
                  <TableRow>
                    <TableCell className="font-medium break-words">
                      {sponsor.name}
                    </TableCell>
                    <TableCell className="break-all">
                      {sponsor.email}
                    </TableCell>
                    <TableCell className="break-words">
                      {sponsor.password_hash || "Non défini"}
                    </TableCell>
                    <TableCell className="break-words">
                      {sponsor.last_login 
                        ? format(new Date(sponsor.last_login), "dd MMMM yyyy à HH:mm", { locale: fr })
                        : "Jamais connecté"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(sponsor)}
                        className="w-full whitespace-nowrap"
                      >
                        Modifier
                      </Button>
                    </TableCell>
                  </TableRow>
                  {editingSponsorId === sponsor.id && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className="p-4 space-y-4 bg-muted/50">
                          <Input
                            type="text"
                            name="name"
                            placeholder="Nom"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, [e.target.name]: e.target.value })}
                          />
                          <Input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, [e.target.name]: e.target.value })}
                          />
                          <Input
                            type="password"
                            name="password_hash"
                            placeholder="Mot de passe"
                            value={editForm.password_hash}
                            onChange={(e) => setEditForm({ ...editForm, [e.target.name]: e.target.value })}
                          />

                          <div className="flex flex-col sm:flex-row justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingSponsorId(null)}
                              className="w-full sm:w-auto"
                            >
                              Annuler
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleUpdate}
                              className="w-full sm:w-auto"
                            >
                              Sauvegarder
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>

      <Dialog open={isAddingSponsor} onOpenChange={setIsAddingSponsor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un parrain</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nom du parrain"
              value={newSponsorForm.name}
              onChange={(e) => setNewSponsorForm({ ...newSponsorForm, name: e.target.value })}
            />
            <Input
              type="email"
              placeholder="Email du parrain"
              value={newSponsorForm.email}
              onChange={(e) => setNewSponsorForm({ ...newSponsorForm, email: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingSponsor(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddSponsor}>
                Ajouter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AssignSponsorDialog
        isOpen={!!selectedChildId}
        onClose={() => setSelectedChildId(null)}
        childId={selectedChildId || ""}
        onAssignComplete={() => {
          setSelectedChildId(null);
          fetchSponsors();
        }}
      />
    </Card>
  );
}