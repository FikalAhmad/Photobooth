import { useCallback, useState } from "react";
import { TextItem } from "../photostrip.types";

type TextFormState = {
  textInput: string;
  textColor: string;
  textSize: number;
  textFont: string;
  textBold: boolean;
};

type UseTextItemsReturn = {
  texts: TextItem[];
  form: TextFormState;
  editingTextId: string | null;
  setTextInput: (v: string) => void;
  setTextColor: (v: string) => void;
  setTextSize: (v: number) => void;
  setTextFont: (v: string) => void;
  setTextBold: (v: boolean) => void;
  addText: () => string | null;
  startEditText: (id: string) => void;
  commitTextEdit: () => void;
  cancelTextEdit: () => void;
  moveText: (id: string, x: number, y: number) => void;
  deleteText: (id: string) => void;
  updateTextRotation: (id: string, rotation: number) => void;
  getText: (id: string) => TextItem | undefined;
};

export const useTextItems = (): UseTextItemsReturn => {
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const [textInput, setTextInput] = useState("Your text here");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textSize, setTextSize] = useState(28);
  const [textFont, setTextFont] = useState("Plus Jakarta Sans");
  const [textBold, setTextBold] = useState(false);

  const addText = useCallback((): string | null => {
    if (!textInput.trim()) return null;
    const id = `text-${Date.now()}`;
    setTexts((prev) => [
      ...prev,
      {
        id,
        text: textInput,
        x: 50,
        y: 50 + Math.random() * 20,
        size: textSize,
        color: textColor,
        fontFamily: textFont,
        bold: textBold,
        rotation: 0,
      },
    ]);
    return id;
  }, [textInput, textSize, textColor, textFont, textBold]);

  const startEditText = useCallback(
    (id: string) => {
      const item = texts.find((t) => t.id === id);
      if (!item) return;
      setTextInput(item.text);
      setTextColor(item.color);
      setTextSize(item.size);
      setTextFont(item.fontFamily);
      setTextBold(item.bold);
      setEditingTextId(id);
    },
    [texts],
  );

  const commitTextEdit = useCallback(() => {
    if (!editingTextId) return;
    setTexts((prev) =>
      prev.map((t) =>
        t.id === editingTextId
          ? { ...t, text: textInput, color: textColor, size: textSize, fontFamily: textFont, bold: textBold }
          : t,
      ),
    );
    setEditingTextId(null);
  }, [editingTextId, textInput, textColor, textSize, textFont, textBold]);

  const cancelTextEdit = useCallback(() => setEditingTextId(null), []);

  const moveText = useCallback((id: string, x: number, y: number) => {
    setTexts((prev) => prev.map((t) => (t.id === id ? { ...t, x, y } : t)));
  }, []);

  const deleteText = useCallback((id: string) => {
    setTexts((prev) => prev.filter((t) => t.id !== id));
    setEditingTextId((prev) => (prev === id ? null : prev));
  }, []);

  const updateTextRotation = useCallback((id: string, rotation: number) => {
    setTexts((prev) => prev.map((t) => (t.id === id ? { ...t, rotation } : t)));
  }, []);

  const getText = useCallback(
    (id: string) => texts.find((t) => t.id === id),
    [texts],
  );

  return {
    texts,
    form: { textInput, textColor, textSize, textFont, textBold },
    editingTextId,
    setTextInput,
    setTextColor,
    setTextSize,
    setTextFont,
    setTextBold,
    addText,
    startEditText,
    commitTextEdit,
    cancelTextEdit,
    moveText,
    deleteText,
    updateTextRotation,
    getText,
  };
};
