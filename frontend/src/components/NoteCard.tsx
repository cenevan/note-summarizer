import React from "react";

interface Props {
  filename: string;
  summary: string;
  actionItems: string;
}

const NoteCard: React.FC<Props> = ({ filename, summary, actionItems }) => (
  <div style={{ borderBottom: "1px solid #ccc", padding: "1rem 0" }}>
    <h3>{filename}</h3>
    <p><strong>Summary:</strong> {summary}</p>
    <p><strong>Action Items:</strong></p>
    <ul>
      {actionItems.split("\n").map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  </div>
);

export default NoteCard;