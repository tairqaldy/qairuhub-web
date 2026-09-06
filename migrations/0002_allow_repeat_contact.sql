-- Contact messages must be allowed to repeat.
--
-- The original unique index covered every kind, so a person who wrote to us
-- once could never write again from the same address: the second message was
-- rejected as a duplicate. That is correct for an application or an RSVP — you
-- only apply once — but wrong for a contact form, which is a conversation.

DROP INDEX IF EXISTS idx_submissions_unique;

-- Applications and RSVPs stay unique per person per form (and per event).
CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_unique
  ON submissions (kind, email, COALESCE(event_slug, ''))
  WHERE kind != 'contact';
