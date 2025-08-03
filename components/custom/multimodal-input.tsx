'use client';

import type {
  Attachment,
  ChatRequestOptions,
  CreateMessage,
  Message,
} from 'ai';
import cx from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import type React from 'react';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';
import { sanitizeUIMessages } from '@/lib/utils';
import { ArrowUpIcon, AttachmentIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';



export function MultimodalInput({
  chatId,
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
}: {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width, height } = useWindowSize();
  const [isFocused, setIsFocused] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [initialViewportHeight, setInitialViewportHeight] = useState(0);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
    
    // Store initial viewport height for mobile keyboard detection
    if (typeof window !== 'undefined') {
      setInitialViewportHeight(window.innerHeight);
    }
  }, []);
  
  // Mobile keyboard detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // Consider keyboard visible if viewport shrunk by more than 150px
      // This threshold works well for most mobile keyboards
      const keyboardThreshold = 150;
      const keyboardVisible = heightDifference > keyboardThreshold;
      
      setIsKeyboardVisible(keyboardVisible);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initialViewportHeight]);
  
  // Handle focus events for mobile keyboard
  const handleFocus = () => {
    setIsFocused(true);
    
    // On mobile, scroll input into view when keyboard appears
    if (width && width <= 768) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 300); // Delay to allow keyboard animation
    }
  };
  
  const handleBlur = () => {
    setIsFocused(false);
  };

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    ''
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    window.history.replaceState({}, '', `/chat/${chatId}`);
    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });
    setAttachments([]);
    setLocalStorageInput('');
    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    attachments,
    handleSubmit,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
  ]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/files/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;
        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      } else {
        const { error } = await response.json();
        toast.error(error);
      }
    } catch (error) {
      toast.error('Failed to upload file, please try again!');
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments]
  );

  const hasContent = input.length > 0 || attachments.length > 0;

  return (
    <div className="relative w-full flex flex-col gap-6">

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
        accept="image/*,.pdf,.doc,.docx,.txt,.csv"
      />

      <AnimatePresence>
        {(attachments.length > 0 || uploadQueue.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-row gap-2 overflow-x-auto pb-2"
          >
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
            {uploadQueue.map((filename) => (
              <PreviewAttachment
                key={filename}
                attachment={{
                  url: '',
                  name: filename,
                  contentType: '',
                }}
                isUploading={true}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>


      <div
        className={cx(
          'relative flex items-end gap-2 p-2 rounded-2xl border transition-all duration-200',
          isFocused
  ? 'border-cyan-500 dark:border-cyan-400 shadow-lg shadow-cyan-500/10 bg-white dark:bg-slate-900'
  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50',

          isLoading && 'border-orange-300 dark:border-orange-600'
        )}
      >
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder="Ask about DeFi, analyze contracts, check prices..."
            value={input}
            onChange={handleInput}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cx(
              'min-h-[74px] max-h-[200px] overflow-hidden resize-none border-0 bg-transparent text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 p-3',
              className
            )}
            rows={1}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                if (isLoading) {
                  toast.error(
                    'Please wait for the model to finish its response!'
                  );
                } else if (hasContent) {
                  submitForm();
                }
              }
            }}
          />
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.preventDefault();
              fileInputRef.current?.click();
            }}
            disabled={isLoading}
            className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Attach file"
          >
            <AttachmentIcon className="text-slate-500 dark:text-slate-400" />
          </Button>

          <Button
            onClick={(event) => {
              event.preventDefault();
              if (isLoading) {
                stop();
                setMessages((messages) => sanitizeUIMessages(messages));
              } else {
                submitForm();
              }
            }}
            disabled={!hasContent && !isLoading}
            className={cx(
              'h-9 w-9 p-0 rounded-xl transition-all duration-200',
              isLoading
  ? 'bg-red-500 hover:bg-red-600 text-white'
  : hasContent
    ? 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/25'
    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'

            )}
            title={isLoading ? 'Stop generation' : 'Send message'}
          >
            {isLoading ? (
              <div className="w-3 h-3 bg-white rounded-sm" />
            ) : (
              <ArrowUpIcon />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
