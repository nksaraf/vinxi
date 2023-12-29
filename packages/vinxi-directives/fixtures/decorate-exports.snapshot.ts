import { createReference } from '~/runtime';

import { cache } from "@solidjs/router";
import { consola } from "consola";
import { createStorage } from "unstorage";
import redisDriver from "unstorage/drivers/redis";
import type { MenuItem, Settings } from "~/types/common";

const debugFetcher = import.meta.env.VITE_COG_DEBUG_FETCHER == 1;
const cacheEnabled = import.meta.env.VITE_COG_CACHE_ENABLED == 1;
const cacheDebug = import.meta.env.VITE_COG_CACHE_DEBUG == 1;

const storage = createStorage({
        driver: redisDriver({
                base: import.meta.env.VITE_KB_REDIS_BASE ?? "cog:",
                host: import.meta.env.VITE_KB_REDIS_HOST ?? "localhost",
                port: import.meta.env.VITE_KB_REDIS_PORT ?? 6379,
        }),
});

async function fetchAPI(path: string) {
        const headers = new Headers();
        headers.append("User-Agent", "chrome");

        if (import.meta.env.VITE_COG_BACKEND_AUTH_LOGIN.length > 0) {
                headers.append(
                        "Authorization",
                        "Basic " +
                                btoa(
                                        import.meta.env.VITE_KB_BACKEND_AUTH_LOGIN +
                                                ":" +
                                                import.meta.env.VITE_KB_BACKEND_AUTH_PASSWORD,
                                ),
                );
        }

        let url = `${import.meta.env.VITE_COG_BACKEND_BASE_URL}/${path}/`;

        if (url.indexOf("?") > -1) {
                // remove trailing slash
                url = url.replace(/\/$/, "");
        }

        try {
                debugFetcher && consola.info(`Fetching ${url}`);
                const response = await fetch(url, { headers });

                // @TODO we should probably cache error responses for a short period of time
                if ("error" in response) {
                        return response;
                }

                if (response.status !== 200) {
                        // @TODO we should probably cache error responses for a short period of time
                        return {
                                code: response.status,
                                error: `Server responded with status ${response.status}`,
                        };
                }

                const json = await response.json().catch((error: string): void => {
                        throw new Error(`Was Fetching ${url}, got ${error}`);
                });

                if (!("data" in json)) {
                        return {
                                code: 500,
                                error: `JSON response does not contain data`,
                        };
                }

                if (cacheEnabled) {
                        await storage.setItem(path, json.data);
                }

                return json.data;
        } catch (error) {
                return { error };
        }
}

export const getDataAtPath = async (path: string) => {
        "use runtime";

        if (cacheEnabled) {
                const data = await storage.getItem(path);
                if (data) {
                        cacheDebug && consola.info(`Cache hit: ${path.slice(0, 80)}…`);
                        return data;
                }
        }

        cacheDebug && consola.info(`Cache miss: ${path.slice(0, 80)}…`);
        return fetchAPI(path);
};

export const getSettings = cache(async (): Promise<Settings> => {
        return getDataAtPath("solid/settings");
}, "settings");

export const getMenuMain = cache(async (): Promise<MenuItem[]> => {
        return getDataAtPath("solid/menu/main");
}, "menu:main");

export const getMenuFooter = cache(async (): Promise<MenuItem[]> => {
        return getDataAtPath("solid/menu/footer");
}, "menu:footer");


;if (typeof getDataAtPath === "function") createReference(getDataAtPath,"test", "getDataAtPath");
if (typeof getSettings === "function") createReference(getSettings,"test", "getSettings");
if (typeof getMenuMain === "function") createReference(getMenuMain,"test", "getMenuMain");
if (typeof getMenuFooter === "function") createReference(getMenuFooter,"test", "getMenuFooter");