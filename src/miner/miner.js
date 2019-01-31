"use strict";

class Miner {
	constructor() {}
}

const mine = (block) => {
	//TO DO: get difficulty and calcultate nonce;
	const difficulty = CalcDifficulty(block, parentBlock);
};

/**
 * TO DO : mod연산 수정

    ethereum difficulty를 구하는 과정에서(consensus/ethash/consensus.go)
    adjust를 valueAdjust로 수정하고 uncle블록 관련과, POW줄이기위한 bombDelay는 제외함

    valueAdjust, minimumDiff, durationLimit은 조정가능
 * @param {*} block
 * @param {*} parentBlock
 */

const calcDifficulty = (block, parentBlock) => {
	let diff = 0;
	let expDiff = 0;
	const adjust = parrentblock.difficulty / 2048; //2048 is difficultyBoundDivisor
	const time = block.header.timestamp;
	const parentTime = parentBlock.header.timestamp;
	const parentDiff = parentBlock.header.difficulty;
	const minimumDiff = 131072;

	// const durationLimit = 13;
	const value = block.header.value;
	let valueAdjust = adjust;

	//10000003은 소수 아무거나 정한거
	let mod = 10000003 % value;

	if (mod !== 0) {
		valueAdjust = mod / 2048;
	} else {
		mod = 10000003 % (value + 1);
		valueAdjust = (mod + 1) / 2048;
	}

	//이더리움의 경우 parentblock의 uncle block이 있으면 max 옆의 값을 1이아닌 2로 바꿔 계산
	expDiff = parentDiff + valueAdjust * max(1 - (time - parentTime) / 9, -99);

	/* durationLimit와 비교해 조정
    if ((time - parentIime) < (durationLimit)) {
        expDiff = parentDiff + adjust;
    } else {
        expDiff = prentDiff - adjust;
    } 
      */

	if (expDiff > minimumDiff) {
		diff = minimumDiff;
	} else diff = expDiff;

	return diff;
};
