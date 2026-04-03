"use client"

import { getProfileTab } from '@/utils/user_service';
import { useEffect, useState } from 'react';
import { TabState } from '@/utils/Types';
import CommentCard from '@/components/User/CommentCard';
import UserCard from '@/components/User/UserCard';
import EventCard from '@/components/Event/EventCard';

function ProfileTable({
            userId,
            tab,
        }: {
    userId: number | string;
    tab: TabState;
}) {
    const [currentTab, setCurrentTab] = useState<TabState>("events");
    const [tabData, setTabData] = useState<any[]>(null);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loadingTab, setLoadingTab] = useState(true);

    const fetchTabData = async (tab: TabState, userId: string, pageNumber = 1) => {
        setLoadingTab(true);
        setCurrentTab(tab);

        try {
            const res = await  getProfileTab(userId, tab, page);
            console.log(res);
            setTabData(res.data);
            setPage(res.current_page || 1);
            setLastPage(res.last_page);

        } catch (e) {
            console.error(e);
        } finally {
            setLoadingTab(false);
        }
    }

    useEffect(() => {
        console.log("Page changed");
        setPage(1);
        console.log(page);
        fetchTabData(tab, String(userId), 1);
    }, [tab, userId]);

    return (
        <>
            {loadingTab && <p>Loading...</p>}

            <div className="mt-4">
                {currentTab == tab && (
                    <>


                        {(!loadingTab && tab === "events" && tabData) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tabData.map(e => <EventCard key={e.id} event={e} />)}
                            </div>
                        )}

                        {!loadingTab && tab === "comments" && (
                            <div className="flex flex-col gap-3">
                                comment
                                {/*{tabData.map(c => <CommentCard key={c.id} comment={c} />)}*/}
                            </div>
                        )}

                        {!loadingTab && (tab === "following" || tab === "friends") && (
                            <div className="flex flex-col gap-3">
                                user
                                {/*{tabData.map(u => <UserCard key={u.id} user={u} />)}*/}
                            </div>
                        )}
                    </>
                )
                }
            </div>

            <div className="flex justify-center gap-2 mt-6">
                <button
                    disabled={page === 1 || loadingTab}
                    onClick={() => fetchTabData(tab, String(userId), page - 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    Prev
                </button>

                <span className="px-3 py-1 text-sm">
                    {page} / {lastPage}
                </span>

                <button
                    disabled={page === lastPage || loadingTab}
                    onClick={() => fetchTabData(tab, String(userId), page + 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </>
    );
}

export default ProfileTable;