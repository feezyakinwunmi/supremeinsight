"use client";

import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block, BlockType } from "@/lib/types";
import { BLOCK_LABELS, BLOCK_TYPES, duplicateBlock, newBlock } from "@/lib/blocks";
import { BlockForm } from "./BlockForms";
import {
  BarChart3, ChevronDown, ChevronUp, Copy, GripVertical, Heading, Image as ImageIcon, Info, List,
  Minus, MousePointerClick, PlayCircle, Plus, Quote, Trash2, Type,
} from "lucide-react";
import type { ComponentType } from "react";

const TYPE_ICONS: Record<BlockType, ComponentType<{ size?: number; className?: string }>> = {
  heading: Heading,
  paragraph: Type,
  image: ImageIcon,
  list: List,
  quote: Quote,
  callout: Info,
  video: PlayCircle,
  stats: BarChart3,
  button: MousePointerClick,
  divider: Minus,
};

// "+" that opens the list of block types and inserts at an exact position
function AddBlock({ onAdd, prominent = false }: { onAdd: (type: BlockType) => void; prominent?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative my-1 flex justify-center">
      {!prominent && <div className="absolute inset-x-0 top-1/2 h-px bg-ink/10" />}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          prominent
            ? "btn btn-primary relative"
            : "relative flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 bg-white text-ink/50 transition hover:border-brand hover:bg-brand hover:text-white"
        }
        title="Add a block here"
      >
        <Plus size={prominent ? 16 : 14} />
        {prominent && "Add block"}
      </button>

      {open && (
        <>
          <button type="button" aria-label="Close" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute top-9 z-50 grid w-[min(22rem,90vw)] grid-cols-2 gap-1.5 rounded-xl border border-ink/15 bg-white p-2 shadow-xl">
            {BLOCK_TYPES.map((type) => {
              const Ico = TYPE_ICONS[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    onAdd(type);
                    setOpen(false);
                  }}
                  className="flex items-start gap-2.5 rounded-lg p-2.5 text-left hover:bg-brand/5"
                >
                  <Ico size={18} className="mt-0.5 shrink-0 text-brand" />
                  <span>
                    <span className="block text-sm font-bold">{BLOCK_LABELS[type].label}</span>
                    <span className="block text-xs leading-snug text-ink/50">{BLOCK_LABELS[type].hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function SortableBlock({
  block,
  index,
  total,
  userId,
  onChange,
  onMove,
  onDuplicate,
  onDelete,
}: {
  block: Block;
  index: number;
  total: number;
  userId: string;
  onChange: (b: Block) => void;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const Ico = TYPE_ICONS[block.type];

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 30 : undefined }}
      className={`rounded-xl border bg-white shadow-sm ${isDragging ? "border-brand opacity-80 shadow-xl" : "border-ink/10"}`}
    >
      <div className="flex items-center gap-1 border-b border-ink/5 px-2 py-1.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          style={{ touchAction: "none" }}
          className="cursor-grab rounded p-1.5 text-ink/40 hover:bg-ink/5 hover:text-ink active:cursor-grabbing"
          title="Drag to move"
        >
          <GripVertical size={16} />
        </button>
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink/55">
          <Ico size={14} className="text-brand" /> {BLOCK_LABELS[block.type].label}
        </span>
        <span className="ml-auto flex items-center">
          <button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="rounded p-1.5 text-ink/45 hover:bg-ink/5 disabled:opacity-25" title="Move up">
            <ChevronUp size={16} />
          </button>
          <button type="button" disabled={index === total - 1} onClick={() => onMove(1)} className="rounded p-1.5 text-ink/45 hover:bg-ink/5 disabled:opacity-25" title="Move down">
            <ChevronDown size={16} />
          </button>
          <button type="button" onClick={onDuplicate} className="rounded p-1.5 text-ink/45 hover:bg-ink/5" title="Duplicate">
            <Copy size={15} />
          </button>
          <button type="button" onClick={onDelete} className="rounded p-1.5 text-ink/45 hover:bg-red-50 hover:text-red-600" title="Delete block">
            <Trash2 size={15} />
          </button>
        </span>
      </div>
      <div className="p-3">
        <BlockForm block={block} onChange={onChange} userId={userId} />
      </div>
    </div>
  );
}

export function BlockList({
  blocks,
  onChange,
  userId,
}: {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  userId: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function insertAt(index: number, type: BlockType) {
    const next = [...blocks];
    next.splice(index, 0, newBlock(type));
    onChange(next);
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = blocks.findIndex((b) => b.id === active.id);
    const to = blocks.findIndex((b) => b.id === over.id);
    if (from < 0 || to < 0) return;
    onChange(arrayMove(blocks, from, to));
  }

  if (blocks.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-ink/15 bg-white p-10 text-center">
        <p className="font-display text-lg font-bold">Start building your story</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-ink/55">
          Add blocks in any order — text, images, lists with icons, quotes, videos. Drag them around whenever you like.
        </p>
        <div className="mt-5">
          <AddBlock prominent onAdd={(t) => insertAt(0, t)} />
        </div>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <div>
          <AddBlock onAdd={(t) => insertAt(0, t)} />
          {blocks.map((block, i) => (
            <div key={block.id}>
              <SortableBlock
                block={block}
                index={i}
                total={blocks.length}
                userId={userId}
                onChange={(b) => onChange(blocks.map((x) => (x.id === b.id ? b : x)))}
                onMove={(dir) => {
                  const to = i + dir;
                  if (to < 0 || to >= blocks.length) return;
                  onChange(arrayMove(blocks, i, to));
                }}
                onDuplicate={() => {
                  const next = [...blocks];
                  next.splice(i + 1, 0, duplicateBlock(block));
                  onChange(next);
                }}
                onDelete={() => {
                  if (window.confirm("Delete this block?")) onChange(blocks.filter((x) => x.id !== block.id));
                }}
              />
              <AddBlock onAdd={(t) => insertAt(i + 1, t)} />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
