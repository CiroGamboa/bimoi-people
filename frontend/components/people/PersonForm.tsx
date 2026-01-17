"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Button, Input, Textarea, TagInput, Modal } from "@/components/ui";
import { CityAutocomplete } from "@/components/map";
import { CREATE_PERSON } from "@/lib/graphql/mutations";
import { GET_GRAPH, GET_PEOPLE } from "@/lib/graphql/queries";

interface PersonFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (person: any) => void;
}

export function PersonForm({ isOpen, onClose, onCreated }: PersonFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    tags: [] as string[],
    offers: "",
    seeks: "",
    city: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const [createPerson, { loading }] = useMutation(CREATE_PERSON, {
    refetchQueries: [GET_GRAPH, GET_PEOPLE],
    onCompleted: (data) => {
      onCreated?.(data.createPerson);
      resetForm();
      onClose();
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      bio: "",
      tags: [],
      offers: "",
      seeks: "",
      city: "",
      latitude: null,
      longitude: null,
    });
  };

  const handleLocationChange = (location: { city: string; latitude: number; longitude: number } | null) => {
    if (location) {
      setFormData({
        ...formData,
        city: location.city,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    } else {
      setFormData({
        ...formData,
        city: "",
        latitude: null,
        longitude: null,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    await createPerson({
      variables: {
        input: formData,
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Person">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Full name"
          required
          autoFocus
        />
        
        <Textarea
          label="Bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={3}
          placeholder="A brief description of who they are..."
        />
        
        <TagInput
          label="Tags"
          value={formData.tags}
          onChange={(tags) => setFormData({ ...formData, tags })}
          placeholder="engineering, design, vc..."
        />
        
        <Textarea
          label="What they offer"
          value={formData.offers}
          onChange={(e) => setFormData({ ...formData, offers: e.target.value })}
          rows={2}
          placeholder="What value can they provide to others?"
        />
        
        <Textarea
          label="What they seek"
          value={formData.seeks}
          onChange={(e) => setFormData({ ...formData, seeks: e.target.value })}
          rows={2}
          placeholder="What are they looking for?"
        />

        <CityAutocomplete
          label="Location"
          value={formData.city}
          onChange={handleLocationChange}
          placeholder="Search for their city..."
        />
        
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={loading || !formData.name.trim()}>
            {loading ? "Creating..." : "Add Person"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
