import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface IconSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the chosen emoji character, e.g. "😀". */
  onSelectIcon: (emoji: string) => void;
}

// WhatsApp-style (Apple) emoji picker. The editor receives the real emoji character, never markup.
export function IconSelector({ isOpen, onClose, onSelectIcon }: IconSelectorProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-4">
        <DialogHeader>
          <DialogTitle>Select Emoji</DialogTitle>
          <DialogDescription>Choose an emoji to insert into your content</DialogDescription>
        </DialogHeader>
        <EmojiPicker
          width="100%"
          height={420}
          emojiStyle={EmojiStyle.APPLE}
          theme={Theme.AUTO}
          lazyLoadEmojis
          previewConfig={{ showPreview: false }}
          onEmojiClick={(emojiData) => {
            onSelectIcon(emojiData.emoji);
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
