export const THEMES: string[] = ["light", "dark"]

export const toolConfig: IObject = {
    "skill-filter": {
        title: "神魔之塔主動技搜尋器",
        docLink: "https://forum.gamer.com.tw/Co.php?bsn=23805&sn=3619702",
        icon: "active_favicon",
        topBtn: ["reset-all", "sort", "and-or", "start-filter"],
        setting: [
            "use_inventory",
            "backpack",
            "duration_option",
            {
                group: "display_group",
                children: [
                    "show_no_data",
                    "show_skill_icon",
                    "tag_tab",
                    "theme",
                ],
            },
        ],
        toolPath: "tos-skill-filter",
    },
    "team-skill-filter": {
        title: "神魔之塔隊伍技搜尋器",
        docLink: "https://forum.gamer.com.tw/Co.php?bsn=23805&sn=3778158",
        icon: "team_favicon",
        topBtn: ["reset-all", "and-or", "start-filter"],
        setting: [
            "result_view",
            {
                group: "display_group",
                children: ["show_skill_icon", "tag_tab", "theme"],
            },
        ],
        toolPath: "tos-team-skill-filter",
    },
    "leader-skill-filter": {
        title: "神魔之塔隊長技搜尋器",
        docLink: "https://forum.gamer.com.tw/Co.php?bsn=23805&sn=4011262",
        icon: "leader_favicon",
        topBtn: ["reset-all", "and-or", "start-filter"],
        setting: [
            "use_inventory",
            "backpack",
            "objective_option",
            {
                group: "display_group",
                children: ["show_skill_icon", "tag_tab", "theme"],
            },
        ],
        toolPath: "tos-leader-skill-filter",
    },
    "craft-filter": {
        title: "神魔之塔龍刻搜尋器",
        docLink: "https://forum.gamer.com.tw/Co.php?bsn=23805&sn=3623648",
        icon: "craft_favicon",
        topBtn: ["reset-all", "and-or", "start-filter"],
        setting: [
            {
                group: "display_group",
                children: ["show_skill_icon", "tag_tab", "theme"],
            },
        ],
        toolPath: "tos-craft-filter",
    },
    "monster-selector": {
        title: "神魔之塔召喚獸編號生成器",
        docLink: "https://forum.gamer.com.tw/Co.php?bsn=23805&sn=3923622",
        icon: "monster_favicon",
        topBtn: ["reset-all", "start-generate"],
        setting: [
            "input_id",
            { group: "display_group", children: ["tag_tab", "theme"] },
        ],
        toolPath: "tos-monster-selector",
    },
    "craft-selector": {
        title: "神魔之塔龍刻編號生成器",
        docLink: "https://forum.gamer.com.tw/Co.php?bsn=23805&sn=3897329",
        icon: "craft_selector_favicon",
        topBtn: ["reset-all", "start-generate"],
        setting: ["input_id", { group: "display_group", children: ["theme"] }],
        toolPath: "tos-craft-selector",
    },
    "backpack-viewer": {
        title: "神魔之塔背包檢視器",
        docLink: "https://forum.gamer.com.tw/Co.php?bsn=23805&sn=3898898",
        icon: "backpack_favicon",
        topInfo: ["uid", "last-update"],
        setting: {
            "All Max 自選": [
                "sort",
                "hide_had_monster",
                "backpack",
                { group: "display_group", children: ["theme"] },
            ],
            古幣封印: [
                "sort",
                "backpack",
                { group: "display_group", children: ["theme"] },
            ],
            魔法石封印: [
                "sort",
                "backpack",
                { group: "display_group", children: ["theme"] },
            ],
            獨立封印: [
                "sort",
                "backpack",
                { group: "display_group", children: ["theme"] },
            ],
            合作系列: [
                "backpack",
                { group: "display_group", children: ["theme"] },
            ],
            其他卡片: [
                "sort",
                "category",
                "backpack",
                { group: "display_group", children: ["theme"] },
            ],
            完整背包: [
                "backpack",
                { group: "display_group", children: ["theme"] },
            ],
        },
        toolPath: "tos-backpack-viewer",
    },
}
