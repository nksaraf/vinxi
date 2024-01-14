import { createReference } from "~/runtime";
import { PostgrestError } from "@supabase/supabase-js";
import { MAX_ROUNDS } from "~/contants";
import { db } from "../database";
import { fetchApi, randomWordApi, wordValidationApi } from "../fetch";
import { log } from "./utils";

export async function createSubstrs(): Promise<{
    substrArr: string[];
    error: undefined;
}>;

export async function createSubstrs(): Promise<{
    substrArr: undefined;
    error: unknown;
}>;

export const createSubstrs = createReference($$function0, "test", "$$function0");

export async function isValidWord(word: string): Promise<{
    isValid: boolean;
    error: undefined;
}>;

export async function isValidWord(word: string): Promise<{
    isValid: undefined;
    error: Error | PostgrestError;
}>;

export const isValidWord = createReference($$function1, "test", "$$function1");
export const getSubstrs = createReference($$function2, "test", "$$function2");
export const getWords = createReference($$function3, "test", "$$function3");

export async function $$function0() {
    const {
        data: substrArr,
        error
    } = await fetchApi(randomWordApi, MAX_ROUNDS);

    if (error) return {
        error
    };

    for (let i = 0; i < substrArr.length; i++) {
        const numLetters = Math.random() > 0.5 ? 3 : 2;

        if (substrArr[i].length === numLetters)
            continue;

        substrArr[i] = makeRandomSubstr(substrArr[i], numLetters);
    }

    return {
        substrArr
    };
}

export async function $$function1(word: string) {
    const {
        data,
        error
    } = await fetchApi(wordValidationApi, word);

    if (error)
        return log(error);

    // Title only present on invalid words.
    return {
        isValid: !data.title
    };
}

export async function $$function2(gameId: number) {
    const {
        data: subStrs,
        error
    } = await db.from("Substrs").select().eq("game", gameId);

    log(error);

    return {
        subStrs: subStrs?.map(item => item.text),
        error
    };
}

export async function $$function3(roundId: number) {
    const {
        data: words,
        error
    } = await db.from("Words").select().eq("round", roundId);

    log(error);

    return {
        words,
        error
    };
}