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

export async function createSubstrs(): Promise<{
	substrArr?: string[];
	error?: unknown;
}> {
	"use runtime";
	const { data: substrArr, error } = await fetchApi(randomWordApi, MAX_ROUNDS);

	if (error) return { error };

	for (let i = 0; i < substrArr.length; i++) {
		const numLetters = Math.random() > 0.5 ? 3 : 2;

		if (substrArr[i].length === numLetters) continue;

		substrArr[i] = makeRandomSubstr(substrArr[i], numLetters);
	}

	return { substrArr };
}

export async function isValidWord(
	word: string,
): Promise<{ isValid: boolean; error: undefined }>;
export async function isValidWord(
	word: string,
): Promise<{ isValid: undefined; error: Error | PostgrestError }>;

export async function isValidWord(
	word: string,
): Promise<{ isValid?: boolean; error?: Error | PostgrestError }> {
	"use runtime";
	const { data, error } = await fetchApi(wordValidationApi, word);
	if (error) return log(error);

	// Title only present on invalid words.
	return { isValid: !data.title };
}

export async function getSubstrs(gameId: number) {
	"use runtime";

	const { data: subStrs, error } = await db
		.from("Substrs")
		.select()
		.eq("game", gameId);

	log(error);

	return { subStrs: subStrs?.map((item) => item.text), error };
}

export async function getWords(roundId: number) {
	"use runtime";

	const { data: words, error } = await db
		.from("Words")
		.select()
		.eq("round", roundId);

	log(error);

	return { words, error };
}
