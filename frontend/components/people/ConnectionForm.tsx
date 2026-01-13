"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button, Textarea, Modal, TrustSlider, Input } from "@/components/ui";
import { CREATE_CONNECTION, UPDATE_CONNECTION, DELETE_CONNECTION } from "@/lib/graphql/mutations";
import { GET_GRAPH, GET_PEOPLE, GET_ME } from "@/lib/graphql/queries";

interface ConnectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  // For create mode - connect person to the user
  targetPersonId?: string;
  targetPersonName?: string;
  // For edit mode
  existingConnection?: {
    relationshipId: string;
    trustLevel: number;
    context?: string;
    notes?: string;
    since?: string;
  };
}

export function ConnectionForm({
  isOpen,
  onClose,
  mode,
  targetPersonId,
  targetPersonName,
  existingConnection,
}: ConnectionFormProps) {
  const { data: meData } = useQuery(GET_ME);
  
  const [formData, setFormData] = useState({
    trustLevel: existingConnection?.trustLevel || 3,
    context: existingConnection?.context || "",
    notes: existingConnection?.notes || "",
    since: existingConnection?.since?.split("T")[0] || "",
  });

  const refetchQueries = [GET_GRAPH, GET_PEOPLE];

  const [createConnection, { loading: creating }] = useMutation(CREATE_CONNECTION, {
    refetchQueries,
    onCompleted: onClose,
  });

  const [updateConnection, { loading: updating }] = useMutation(UPDATE_CONNECTION, {
    refetchQueries,
    onCompleted: onClose,
  });

  const [deleteConnection, { loading: deleting }] = useMutation(DELETE_CONNECTION, {
    refetchQueries,
    onCompleted: onClose,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const input = {
      trustLevel: formData.trustLevel,
      context: formData.context || null,
      notes: formData.notes || null,
      since: formData.since || null,
    };

    if (mode === "create" && meData?.me && targetPersonId) {
      await createConnection({
        variables: {
          fromId: meData.me.id,
          toId: targetPersonId,
          input,
        },
      });
    } else if (mode === "edit" && existingConnection) {
      await updateConnection({
        variables: {
          relationshipId: existingConnection.relationshipId,
          input,
        },
      });
    }
  };

  const handleDelete = async () => {
    if (!existingConnection) return;
    if (confirm("Are you sure you want to remove this connection?")) {
      await deleteConnection({
        variables: { relationshipId: existingConnection.relationshipId },
      });
    }
  };

  const loading = creating || updating;
  const title = mode === "create" 
    ? `Connect with ${targetPersonName}`
    : "Edit Connection";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TrustSlider
          value={formData.trustLevel}
          onChange={(trustLevel) => setFormData({ ...formData, trustLevel })}
        />
        
        <Textarea
          label="How do you know them?"
          value={formData.context}
          onChange={(e) => setFormData({ ...formData, context: e.target.value })}
          rows={2}
          placeholder="Met at a conference, former colleague, mutual friend introduced us..."
        />
        
        <Textarea
          label="Why are they valuable? (private notes)"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
          placeholder="Great at technical architecture, very well connected in VC circles..."
        />
        
        <Input
          type="date"
          label="Known since"
          value={formData.since}
          onChange={(e) => setFormData({ ...formData, since: e.target.value })}
        />
        
        <div className="flex gap-3 pt-2">
          {mode === "edit" && (
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "..." : "Remove"}
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? "Saving..." : mode === "create" ? "Connect" : "Update"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
