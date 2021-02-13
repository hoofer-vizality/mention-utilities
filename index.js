import React from 'react';

import { Plugin } from '@vizality/entities';
import { patch, unpatch } from '@vizality/patcher';
import { getModuleByDisplayName, getModule, getModules } from '@vizality/webpack';
import { get } from '@vizality/http';
import { open as openModal } from '@vizality/modal';
import { clipboard } from 'electron';

export default class MentionUtilities extends Plugin {
    async start () {

        // modules
        const menu = await getModule(["MenuItem"]);
        const { getGuildId } = await getModule(["getLastSelectedGuildId"]);
        const GuildChannelUserContextMenu = await getModule(m => m.default && m.default.displayName === 'GuildChannelUserContextMenu');
        const DeveloperContextMenu = await getModule(m => m.default && m.default.displayName === 'DeveloperContextMenu');
        const ChannelListVoiceChannelContextMenu = await getModule(m => m.default && m.default.displayName === 'ChannelListVoiceChannelContextMenu');
        const ChannelListTextChannelContextMenu = await getModules(m => m.default && m.default.displayName === 'ChannelListTextChannelContextMenu')[2];

        console.log(ChannelListTextChannelContextMenu);

        // injectors
        patch('channel-inject', ChannelListTextChannelContextMenu, "default", (args, res) => {
            // quick functions
            function push(element){
                res.props.children.push(element)
            }

            // channel copy mention
            if (args[0]['channel'] && args[0]['channel']['id']){
                var id = args[0]['channel']['id'];
                var ele = React.createElement(menu.MenuItem, {
                    id: "mu-copy-channel-mention",
                    label: "Copy Channel Mention",
                    action: async () => {
                        clipboard.writeText(`<#${id}>`);
                    }
                })
                push(ele);
            }
            return res;
        })

        patch('voice-channel-inject', ChannelListVoiceChannelContextMenu, "default", (args, res) => {
            // quick functions
            function push(element){
                res.props.children.push(element)
            }

            // voice channel copy link
            if (args[0]['channel'] && args[0]['channel']['id']){
                var id = args[0]['channel']['id'];
                var gid = getGuildId();
                var ele = React.createElement(menu.MenuItem, {
                    id: "mu-copy-vc-channel-link",
                    label: "Copy Voice Channel Link",
                    action: async () => {
                        clipboard.writeText(`https://discord.com/channels/${gid}/${id}/`);
                    }
                })
                push(ele);
            }
            return res;
        })

        patch('role-inject', DeveloperContextMenu, "default", (args, res) => {
            // quick functions
            res.props.children = [res.props.children]
            function push(element){
                res.props.children.push(element)
            }

            // role copy mention
            if (args[0]['id']){
                var id = args[0]['id'];
                var ele = React.createElement(menu.MenuItem, {
                    id: "mu-copy-role-mention",
                    label: "Copy Role Mention",
                    action: async () => {
                        clipboard.writeText(`<@&${id}>`);
                    }
                })
                push(ele);
            }
            return res;
        })
        
        patch('menu-inject', GuildChannelUserContextMenu, "default", (args, res) => {
            // quick functions
            function push(element){
                res.props.children.props.children.push(element)
            }

            // user copy mention
            if (args[0]['user'] && args[0]['user']['id']){
                var id = args[0]['user']['id'];
                var ele = React.createElement(menu.MenuItem, {
                    id: "mu-copy-user-mention",
                    label: "Copy User Mention",
                    action: async () => {
                        clipboard.writeText(`<@${id}>`);
                    }
                })
                push(ele);
            }
            return res;
        });

    }

    stop () {
        unpatch('channel-inject')
        unpatch('voice-channel-inject')
        unpatch('role-inject')
        unpatch('menu-inject')
    }
}