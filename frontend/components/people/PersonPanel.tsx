"use client";

import { useMutation } from "@apollo/client";
import { Button, Input, Textarea, TagInput } from "@/components/ui";
import { UPDATE_PERSON, DELETE_PERSON, SET_AS_ME } from "@/lib/graphql/mutations";
import { GET_GRAPH, GET_PEOPLE } from "@/lib/graphql/queries";
import { getDegreeColor, getTrustColor } from "@/lib/utils";
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
  });

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
    <div className="h-full flex flex-col bg-surface-elevated border-l border-border animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-background"
            style={{ backgroundColor: getDegreeColor(person.degree || 0) }}
          >
            {person.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-text-primary">{person.name}</h2>
            <span
              className="text-xs font-mono px-1.5 py-0.5 rounded"
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
          className="p-2 text-text-muted hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isEditing ? (
          /* Edit Mode */
          <div className="space-y-4">
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
          </div>
        ) : (
          /* View Mode */
          <>
            {person.bio && (
              <div>
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Bio</h3>
                <p className="text-text-secondary text-sm">{person.bio}</p>
              </div>
            )}

            {person.tags.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {person.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-surface text-text-secondary text-xs rounded-md border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {person.offers && (
              <div>
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Offers</h3>
                <p className="text-text-secondary text-sm">{person.offers}</p>
              </div>
            )}

            {person.seeks && (
              <div>
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Seeks</h3>
                <p className="text-text-secondary text-sm">{person.seeks}</p>
              </div>
            )}

            {/* Connection info (if viewing a connection) */}
            {connection && (
              <div className="pt-4 border-t border-border space-y-3">
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide">Connection</h3>
                
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary text-sm">Trust:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor:
                            level <= connection.trustLevel
                              ? getTrustColor(level)
                              : "#2a2a3a",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {connection.context && (
                  <div>
                    <span className="text-text-secondary text-sm">Context: </span>
                    <span className="text-text-primary text-sm">{connection.context}</span>
                  </div>
                )}

                {connection.since && (
                  <div>
                    <span className="text-text-secondary text-sm">Since: </span>
                    <span className="text-text-primary text-sm font-mono">
                      {new Date(connection.since).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <Button size="sm" variant="secondary" onClick={onEditConnection}>
                  Edit Connection
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border space-y-2">
        {isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={updating}>
              {updating ? "Saving..." : "Save"}
            </Button>
          </div>
        ) : (
          <>
            <Button variant="secondary" className="w-full" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
            {!person.isUser && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-text-muted"
                  onClick={handleSetAsMe}
                >
                  Set as Me
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-red-500 hover:text-red-400"
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
