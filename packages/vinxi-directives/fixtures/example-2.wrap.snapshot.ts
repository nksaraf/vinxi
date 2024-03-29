import { createReference } from "~/runtime";
import { cache } from "@solidjs/router";
import { isServer } from "solid-js/web";
import { Story, StoryTypes, User } from "~/types";
const story = (path: string) => `https://node-hnapi.herokuapp.com/${path}`;
const user = (path: string) => `https://hacker-news.firebaseio.com/v0/${path}.json`;
export const fetchAPI = createReference($$function0, "test", "$$function0");
console.log(fetchAPI.url);

const mapStories = {
    top: "news",
    new: "newest",
    show: "show",
    ask: "ask",
    job: "jobs"
} as const;

export const getStories = cache(
    async (type: StoryTypes, page: number): Promise<Story[]> => fetchAPI(`${mapStories[type]}?page=${page}`),
    "stories"
);

export const getStory = cache(async (id: string): Promise<Story> => fetchAPI(`item/${id}`), "story");
export const getUser = cache(async (id: string): Promise<User> => fetchAPI(`user/${id}`), "user");

export async function $$function0(path: string) {
    console.log(path);
    const url = path.startsWith("user") ? user(path) : story(path);

    const headers: Record<string, string> = isServer ? {
        "User-Agent": "chrome"
    } : {};

    try {
        let response = await fetch(url, {
            headers
        });

        let text = await response.text();

        try {
            if (text === null) {
                return {
                    error: "Not found"
                };
            }

            return JSON.parse(text);
        } catch (e) {
            console.error(`Received from API: ${text}`);
            console.error(e);

            return {
                error: e
            };
        }
    } catch (error) {
        return {
            error
        };
    }
}