import {
    skillFunctionString,
    teamSkillActivateString,
    teamSkillFunctionString,
} from "src/constant/filterConstants"
import { leaderSkillData } from "src/constant/leaderData"
import { monsterData } from "src/constant/monsterData"

const getIncorrectTagForActiveSkill = () => {
    const tags = skillFunctionString?.flat()

    const incorrectSkill: IObject[] = []
    monsterData?.forEach((monster) => {
        const monsterIncorrectSkill: string[] = []
        monster?.skill?.forEach((skill: IObject) => {
            const skillTags = skill?.tag?.map(
                (tag: string | [string, number]) => {
                    return Array.isArray(tag) ? tag[0] : tag
                },
            )

            const areTagsCorrect = skillTags?.every((tag: string) =>
                tags?.includes(tag),
            )

            if (!areTagsCorrect) monsterIncorrectSkill.push(skill?.name)
        })

        if (monsterIncorrectSkill?.length) {
            incorrectSkill.push({
                id: monster?.id,
                name: monster?.name,
                skills: monsterIncorrectSkill,
            })
        }
    })
    console.log(
        incorrectSkill.length
            ? `Incorrect tags for active skill data: \n${incorrectSkill?.map((monster) => `- ${monster?.id} (${monster?.name}): ${monster?.skills?.join(", ")}`).join("\n")}`
            : "No incorrect tags in active skill data",
    )
}

const getIncorrectTagForTeamSkill = () => {
    const skillTags = teamSkillFunctionString?.flat()
    const activateTags = teamSkillActivateString?.flat()

    const incorrectSkill: IObject[] = []
    monsterData?.forEach((monster) => {
        const monsterIncorrectSkillIndex: IObject[] = []
        monster?.teamSkill?.forEach((skill: IObject, index: number) => {
            const incorrectSkillTags = skill?.skill_tag?.filter(
                (tag: string) => !skillTags?.includes(tag),
            )
            const incorrectActivateTags = skill?.activate_tag?.filter(
                (tag: string) => !activateTags?.includes(tag),
            )

            if (incorrectSkillTags?.length || incorrectActivateTags?.length)
                monsterIncorrectSkillIndex.push({
                    index,
                    tags: [...incorrectSkillTags, ...incorrectActivateTags],
                })
        })

        if (monsterIncorrectSkillIndex?.length) {
            incorrectSkill.push({
                id: monster?.id,
                name: monster?.name,
                skills: monsterIncorrectSkillIndex,
            })
        }
    })
    console.log(
        incorrectSkill.length
            ? `Incorrect tags for team skill data: \n${incorrectSkill?.map((monster) => `- ${monster?.id} (${monster?.name}): ${monster?.skills?.map((skill: IObject) => `${skill?.index} (${skill?.tags?.join(", ")})`)?.join(", ")}`).join("\n")}`
            : "No incorrect tags in team skill data",
    )
}

const getOmittedMonsterInLeaderData = () => {
    const allMonsterId = monsterData
        ?.filter((monster: IObject) => monster?.name?.length > 0)
        ?.map((monster: IObject) => monster?.id)

    const monsterIdFiledInLeaderData = leaderSkillData
        ?.map((skill: IObject) => skill?.monster)
        ?.flat()

    const excludedMonsters = [
        10402, // 終尾巨人
    ]
    const omittedMonsters = allMonsterId
        ?.filter(
            (monster) =>
                !monsterIdFiledInLeaderData?.includes(monster) &&
                !excludedMonsters.includes(monster),
        )
        ?.map((id) => ({
            id,
            name: monsterData?.find((monster) => monster?.id === id)?.name,
        }))

    console.log(
        omittedMonsters.length
            ? `Missing monsters in leader skill data: \n${omittedMonsters?.map((monster) => `- ${monster?.id} (${monster?.name})`).join("\n")}`
            : "No missing monsters in leader skill data",
    )
}

console.log("\n====================\n")
// check if there's incorrect tag in active skill data
getIncorrectTagForActiveSkill()

console.log("\n====================\n")
// check if there's incorrect tag in team skill data
getIncorrectTagForTeamSkill()

console.log("\n====================\n")
// check if there's missing monster in leader skill data
getOmittedMonsterInLeaderData()
