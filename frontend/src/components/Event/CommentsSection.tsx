'use client';

import { useContext, useEffect, useMemo, useState } from 'react'
import Button from '@/components/Button'
import Link from 'next/link';
import { createComment, deleteComment, getEventComments, updateComment } from '@/utils/comment_service';
import { Comment } from '@/utils/Types';
import Loading from '@/components/Loading';
import UserAvatar from '@/components/User/UserAvatar';
import { useAuth } from '@/hooks/auth';
import { SnackbarContext } from '@/context/SnackbarContext'
import { extractErrorMessage, extractValidationErrors, isValidationError } from '@/utils/response_helper'

const MIN_LENGTH = 3;
const MAX_LENGTH = 500;

interface Params {
    eventId: number | string;
}

function CommentsSection({ eventId }: Params) {
    const { user } = useAuth();

    const [comments, setComments] = useState<Comment[] | null>(null);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState('');
    const [editingError, setEditingError] = useState('');
    const [actionCommentId, setActionCommentId] = useState<number | null>(null);
    const [nowMs, setNowMs] = useState<number | null>(null);
    const addSnackbarMessage = useContext(SnackbarContext);

    useEffect(() => {
        const getComments = async () => {
            if (!eventId) return;
            const res = await getEventComments(eventId);

            setComments(res);
        }
        getComments();
    }, [eventId]);

    useEffect(() => {
        setNowMs(Date.now());
        const intervalId = window.setInterval(() => {
            setNowMs(Date.now());
        }, 60_000);

        return () => window.clearInterval(intervalId);
    }, []);

    const validate = (text: string) => {
        const trimmedText = text.trim();
        if (trimmedText.length !== 0 && trimmedText.length < MIN_LENGTH) {
            return `Komentāram jābūt vismaz ${MIN_LENGTH} rakstzīmes garam`;
        }
        return "";
    }

    const canSubmit = useMemo(() =>
        !error
        && !!newComment.trim()
        && !isSubmitting
        , [error, newComment, isSubmitting]
    );

    const formatRelativeTime = (dateString: string) => {
        if (!nowMs) return '';

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) return '';
        
        setNowMs(Date.now());

        const diffSeconds = Math.round((nowMs - date.getTime()) / 1000);
        const absSeconds = Math.abs(diffSeconds);
        const rtf = new Intl.RelativeTimeFormat('lv-LV', { numeric: 'auto' });

        if (absSeconds < 60) {
            return rtf.format(-diffSeconds, 'second');
        }

        const diffMinutes = Math.round(diffSeconds / 60);
        if (Math.abs(diffMinutes) < 60) {
            return rtf.format(-diffMinutes, 'minute');
        }

        const diffHours = Math.round(diffMinutes / 60);
        if (Math.abs(diffHours) < 24) {
            return rtf.format(-diffHours, 'hour');
        }

        const diffDays = Math.round(diffHours / 24);
        if (Math.abs(diffDays) < 30) {
            return rtf.format(-diffDays, 'day');
        }

        const diffMonths = Math.round(diffDays / 30);
        if (Math.abs(diffMonths) < 12) {
            return rtf.format(-diffMonths, 'month');
        }

        const diffYears = Math.round(diffMonths / 12);
        return rtf.format(-diffYears, 'year');
    }

    const isEdited = (comment: Comment) => {
        if (!comment.updated_at) return false;
        return comment.updated_at !== comment.created_at;
    }

    const handleSubmit = async () => {
        const validationError = validate(newComment);

        if (validationError) {
            setError(validationError);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await createComment(newComment.trim(), eventId);

            if (response.status === 'ok') {
                const createdComment = response.data?.comment as Comment | undefined;
                if (createdComment) {
                    setComments((prev) => (prev ? [createdComment, ...prev] : [createdComment]));
                }
            }

            setNewComment('');
            setError('');
        } catch (error) {
            if (isValidationError(error)) {
                const errors = extractValidationErrors(error);
                Object.values(errors).forEach(messages => {
                    messages?.forEach(message => addSnackbarMessage(message, 'error'));
                });
            } else {
                const errorMessage = extractErrorMessage(error);
                addSnackbarMessage(errorMessage, 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleChange = (value: string) => {
        setNewComment(value);
        setError(validate(value));
    }

    const startEditing = (comment: Comment) => {
        setEditingId(comment.id);
        setEditingText(comment.text);
        setEditingError('');
    }

    const cancelEditing = () => {
        setEditingId(null);
        setEditingText('');
        setEditingError('');
    }

    const saveEditing = async (commentId: number) => {
        const validationError = validate(editingText);
        if (validationError) {
            setEditingError(validationError);
            return;
        }

        setActionCommentId(commentId);
        try {
            const newText = editingText.trim();
            await updateComment(commentId, newText);
            setComments((prev) => prev?.map((comment) => {
                if (comment.id !== commentId) {
                    return comment;
                }

                return {
                    ...comment,
                    text: newText,
                    updated_at: new Date().toISOString(),
                };
            }) ?? []);
            cancelEditing();
        } finally {
            setActionCommentId(null);
        }
    }

    const removeComment = async (commentId: number) => {
        setActionCommentId(commentId);
        try {
            await deleteComment(commentId);
            setComments((prev) => prev?.filter((comment) => comment.id !== commentId) ?? []);
            if (editingId === commentId) {
                cancelEditing();
            }
        } finally {
            setActionCommentId(null);
        }
    }

    if (comments == null) return <Loading />

    return (
        <section className="py-2">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Komentāri</h2>

            {user ? (
                <div className="mb-6 flex flex-col gap-2">
                    <textarea
                        value={newComment}
                        onChange={(e) => handleChange(e.target.value.slice(0, MAX_LENGTH))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (canSubmit) handleSubmit();
                            }
                        }}
                        placeholder="Uzraksti komentāru..."
                        className={`w-full rounded-lg border p-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-400'}`}
                        rows={3}
                    />

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-red-500">{error}</span>
                        <span className="text-gray-400">{newComment.length}/{MAX_LENGTH}</span>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className="text-sm font-medium"
                        >
                            {isSubmitting ? 'Publicē...' : 'Publicēt'}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
                    Lai atstātu komentāru, <Link href="/login" className="font-semibold underline hover:text-blue-700">ielogojies</Link>.
                </div>
            )}

            <div className="flex flex-col divide-y divide-gray-100">
                {comments.map((comment) => {
                    const isOwner = user ? user?.id === comment.user.id : false;
                    const isEditing = editingId === comment.id;
                    const isBusy = actionCommentId === comment.id;

                    return (
                        <article key={comment.id} className="py-4 first:pt-0">
                            <div className="flex items-start gap-3">
                                <UserAvatar avatarPath={comment.user.avatar_path} name={comment.user.name} className="h-8 w-8 flex-shrink-0" />

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                        <p className="text-sm font-semibold text-gray-900">{comment.user.name}</p>
                                        <span className="text-xs text-gray-400">{formatRelativeTime(comment.created_at)}</span>
                                        {isEdited(comment) && (
                                            <span className="text-xs text-amber-500">(rediģēts)</span>
                                        )}
                                    </div>

                                    {!isEditing && (
                                        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                                            {comment.text}
                                        </p>
                                    )}

                                    {isEditing && (
                                        <div className="mt-2">
                                            <textarea
                                                value={editingText}
                                                onChange={(e) => {
                                                    setEditingText(e.target.value);
                                                    setEditingError(validate(e.target.value));
                                                }}
                                                className={`w-full rounded-lg border p-3 text-sm resize-none focus:outline-none focus:ring-2 ${editingError ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-400'}`}
                                                rows={3}
                                            />
                                            {editingError && <div className="mt-1 text-xs text-red-500">{editingError}</div>}

                                            <div className="mt-2 flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    disabled={!!editingError || !editingText.trim() || isBusy}
                                                    onClick={() => saveEditing(comment.id)}
                                                    variant="secondary"
                                                    className="px-3 py-1.5 text-xs font-medium"
                                                >
                                                    {isBusy ? 'Saglabā...' : 'Saglabāt'}
                                                </Button>
                                                <button
                                                    type="button"
                                                    onClick={cancelEditing}
                                                    className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                                                >
                                                    Atcelt
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {isOwner && !isEditing && (
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => startEditing(comment)}
                                            className="rounded px-2 py-1 text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                                        >
                                            Rediģēt
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeComment(comment.id)}
                                            disabled={isBusy}
                                            className="rounded px-2 py-1 text-xs text-gray-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-60"
                                        >
                                            Dzēst
                                        </button>
                                    </div>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    )
}

export default CommentsSection