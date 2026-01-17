"use client";

import { useMutation } from "@apollo/client";
import { Button, Input, Textarea, TagInput } from "@/components/ui";
import { CityAutocomplete } from "@/components/map";
import { UPDATE_PERSON, DELETE_PERSON, SET_AS_ME } from "@/lib/graphql/mutations";
import { GET_GRAPH, GET_PEOPLE } from "@/lib/graphql/queries";
import { getDegreeColor, getTrustColor, getTrustLabel } from "@/lib/utils";
import { useState } from "react";

interface Person {
  id: string;
  name: string;
  bio?: string;
  tags: string[];
  offers?: string;
  seeks?: string;
  isUser: boolean;
  degree?: number;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface Connection {
  relationshipId: string;
  trustLevel: number;
  context?: string;
  since?: string;
}

interface PersonPanelProps {
  person: Person;
  connection?: Connection;
  onClose: () => void;
  onEditConnection?: () => void;
}

export function PersonPanel({
  person,
  connection,
  onClose,
  onEditConnection,
}: PersonPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: person.name,
    bio: person.bio || "",
    tags: person.tags,
    offers: person.offers || "",
    seeks: person.seeks || "",
    city: person.city || "",
    latitude: person.latitude || null,
    longitude: person.longitude || null,
  });

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

  const [updatePerson, { loading: updating }] = useMutation(UPDATE_PERSON, {
    refetchQueries: [GET_GRAPH, GET_PEOPLE],
  });

  const [deletePerson, { loading: deleting }] = useMutation(DELETE_PERSON, {
    refetchQueries: [GET_GRAPH, GET_PEOPLE],
    onCompleted: () => onClose(),
  });

  const [setAsMe] = useMutation(SET_AS_ME, {
    refetchQueries: [GET_GRAPH, GET_PEOPLE],
  });

  const handleSave = async () => {
    await updatePerson({
      variables: {
        id: person.id,
        input: formData,
      },
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${person.name}? This will also remove all their connections.`)) {
      await deletePerson({ variables: { id: person.id } });
    }
  };

  const handleSetAsMe = async () => {
    if (confirm(`Set ${person.name} as yourself? This will change the graph center.`)) {
      await setAsMe({ variables: { id: person.id } });
    }
  };

  const degreeLabel = person.degree === 0 ? "You" : person.degree === 1 ? "1st degree" : "2nd degree";

  return (
    <div className="h-full flex flex-col bg-surface-elevated/95 backdrop-blur-xl border-l border-border slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-background text-lg avatar-bimoi"
            style={{ 
              backgroundColor: getDegreeColor(person.degree || 0),
              boxShadow: `0 0 20px ${getDegreeColor(person.degree || 0)}40`
            }}
          >
            {person.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-text-primary text-lg">{person.name}</h2>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                color: getDegreeColor(person.degree || 0),
                backgroundColor: `${getDegreeColor(person.degree || 0)}20`,
              }}
            >
              {degreeLabel}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-text-muted hover:text-bimoi-magenta hover:bg-surface rounded-full transition-all duration-200 hover:rotate-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {isEditing ? (
          /* Edit Mode */
          <div className="space-y-5">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Textarea
              label="Bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              placeholder="A brief description..."
            />
            <TagInput
              label="Tags (skills, industries, interests)"
              value={formData.tags}
              onChange={(tags) => setFormData({ ...formData, tags })}
            />
            <Textarea
              label="What they offer"
              value={formData.offers}
              onChange={(e) => setFormData({ ...formData, offers: e.target.value })}
              rows={2}
              placeholder="What value can they provide?"
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
          </div>
        ) : (
          /* View Mode */
          <>
            {person.bio && (
              <div className="card-bimoi p-4">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Bio</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{person.bio}</p>
              </div>
            )}

            {person.tags.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {person.tags.map((tag) => (
                    <span
                      key={tag}
                      className="tag-bimoi"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {person.offers && (
              <div className="card-bimoi p-4">
                <h3 className="text-xs font-semibold text-bimoi-gold uppercase tracking-wider mb-2">✦ Offers</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{person.offers}</p>
              </div>
            )}

            {person.seeks && (
              <div className="card-bimoi p-4">
                <h3 className="text-xs font-semibold text-bimoi-purple uppercase tracking-wider mb-2">◆ Seeks</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{person.seeks}</p>
              </div>
            )}

            {person.city && (
              <div className="card-bimoi p-4">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Location
                </h3>
                <p className="text-text-secondary text-sm">{person.city}</p>
              </div>
            )}

            {/* Connection info (if viewing a connection) */}
            {connection && (
              <div className="pt-5 border-t border-border space-y-4">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Connection</h3>
                
                <div className="card-bimoi p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm font-medium">Trust Level</span>
                    <span
                      className="text-sm font-semibold px-3 py-1 rounded-full"
                      style={{ 
                        color: getTrustColor(connection.trustLevel), 
                        backgroundColor: `${getTrustColor(connection.trustLevel)}20`
                      }}
                    >
                      {connection.trustLevel}/5 · {getTrustLabel(connection.trustLevel)}
                    </span>
                  </div>
                  
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className="flex-1 h-3 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor:
                            level <= connection.trustLevel
                              ? getTrustColor(level)
                              : "#2a2a3a",
                          boxShadow: level <= connection.trustLevel 
                            ? `0 2px 8px ${getTrustColor(level)}40` 
                            : "none"
                        }}
                      />
                    ))}
                  </div>

                  {connection.context && (
                    <div>
                      <span className="text-text-muted text-xs font-medium">Context</span>
                      <p className="text-text-primary text-sm mt-1">{connection.context}</p>
                    </div>
                  )}

                  {connection.since && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted font-medium">Since</span>
                      <span className="text-text-primary font-mono">
                        {new Date(connection.since).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <Button size="sm" variant="outline" onClick={onEditConnection} className="w-full">
                  Edit Connection
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-5 border-t border-border space-y-3">
        {isEditing ? (
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={updating}>
              {updating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        ) : (
          <>
            <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
            {!person.isUser && (
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-text-muted hover:text-bimoi-gold"
                  onClick={handleSetAsMe}
                >
                  Set as Me
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
