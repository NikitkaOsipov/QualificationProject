'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

interface EventDescriptionMarkdownProps {
    content?: string;
    className?: string;
}

const sanitizeSchema = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames ?? []), 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'input'],
    attributes: {
        ...defaultSchema.attributes,
        a: [...(defaultSchema.attributes?.a ?? []), 'target', 'rel'],
        input: [['type', 'checkbox'], 'checked', 'disabled'],
    },
};

export default function EventDescriptionMarkdown({ content, className }: EventDescriptionMarkdownProps) {
    if (!content?.trim()) return null;

    const wrapperClassName = [
        'prose prose-sm md:prose-base max-w-none text-gray-800 prose-headings:text-gray-900 prose-headings:font-semibold prose-p:my-3 prose-p:leading-7 prose-li:my-1 prose-a:text-indigo-700 prose-a:no-underline hover:prose-a:underline prose-pre:bg-gray-900 prose-pre:rounded-lg prose-code:before:content-none prose-code:after:content-none',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={wrapperClassName}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}>
                {content}
            </ReactMarkdown>
        </div>
    );
}
