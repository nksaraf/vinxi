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
export async function $$function0() {}
export async function $$function1(word: string) {}
export async function $$function2(gameId: number) {}
export async function $$function3(roundId: number) {}