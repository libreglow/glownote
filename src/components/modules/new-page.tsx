'use client';

import { useState } from 'react';
import { Modal } from '../ui/dialog';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import { Input } from '../ui/input';
import EmojiPicker, { Emoji } from 'emoji-picker-react';
import { Button } from '../ui/button';
import { Smile } from 'lucide-react';

const NewPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null); // emoji character
  const [selectedUnified, setSelectedUnified] = useState<string | null>(null); // unified codepoint

  return (
    <div className="w-full  flex items-center justify-center ">
      {!isModalOpen && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus />
        </motion.button>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex flex-col gap-4">
          <p className="text-lg font-semibold flex items-center gap-2">
            {selectedUnified ? (
              <Emoji unified={selectedUnified} size={22} />
            ) : (
              <Emoji unified="1f642" size={22} />
            )}
            {title || 'Title'}
          </p>

          <Input
            className="w-full"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-700 dark:border-white/10 dark:bg-[#1c1c1c] dark:text-white transition-colors"
            title={showEmojiPicker ? 'إخفاء الإيموجي' : 'إظهار الإيموجي'}
          >
            <Smile size={18} />
          </button>

          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <EmojiPicker
                  className="w-full"
                  onEmojiClick={(emojiObject) => {
                    setSelectedEmoji(emojiObject.emoji);
                    setSelectedUnified(emojiObject.unified);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Button className="w-full font-bold">Save</Button>
        </div>
      </Modal>
    </div>
  );
};

export default NewPage;
