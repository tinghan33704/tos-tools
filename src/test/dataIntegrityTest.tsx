import { leaderSkillData } from "src/constant/leaderData"
import { monsterData } from "src/constant/monsterData"

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
    const omittedMonsters = allMonsterId?.filter(
        (monster) =>
            !monsterIdFiledInLeaderData?.includes(monster) &&
            !excludedMonsters.includes(monster),
    )

    console.log(
        omittedMonsters.length
            ? `Missing monsters in leader skill data: \n- ${omittedMonsters.join(", ")}`
            : "No missing monsters in leader skill data",
    )
}

// check if there's missing monster in leader skill data
getOmittedMonsterInLeaderData()
