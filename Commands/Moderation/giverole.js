const Discord = require('discord.js')
const Keyv = require('keyv')
const logchannels = new Keyv(process.env.logchannels)

module.exports = {
  name: 'giverole',
  description: `Adds a role to a user.`,
  usage: 'giverole @`member` `role`',
  guildOnly: true,
  async execute (message, args, prefix) {
    let member = message.mentions.members.first()
    if (!message.guild.me.hasPermission('MANAGE_ROLES')) {
      let msg = await message.channel.send(
        'I need the Manage Roles permission in order to execute this command.'
      )
      msg.delete({ timeout: 10000 })
      return message.react('❌')
    }
    if (!args[1]) {
      let msg = await message.channel.send(
        `Proper command usage: ${prefix}giverole @[member] [role]`
      )
      msg.delete({ timeout: 10000 })
      return message.react('❌')
    }
    args.shift()
    let rolename = args.join(' ').toLowerCase()
    let role = message.guild.roles.cache.find(role =>
      role.name.toLowerCase().startsWith(rolename)
    )
    if (!role) {
      let msg = await message.channel.send(
        `Couldn't find any roles named ${rolename}`
      )
      msg.delete({ timeout: 10000 })
      return message.react('❌')
    }
    if (member.roles.cache.has(role.id)) {
      let msg = await message.channel.send(
        `${member.user.username} already has that role.`
      )
      msg.delete({ timeout: 10000 })
      return message.react('❌')
    }
    let bothighestrole = -1
    message.guild.me.roles.cache.map(r => {
      if (r.position > bothighestrole) bothighestrole = r.position
    })
    if (role.position >= bothighestrole) {
      let msg = await message.channel.send(
        'My roles must be higher than the role that you want to give!'
      )
      msg.delete({ timeout: 10000 })
      return message.react('❌')
    }
    if (!message.member.hasPermission('MANAGE_ROLES')) {
      let msg = await message.channel.send(
        'You need the Manage Roles permission in order to run this command.'
      )
      msg.delete({ timeout: 10000 })
      return message.react('❌')
    }
    let highestrole = -1
    message.member.roles.cache.map(r => {
      if (r.position > highestrole) highestrole = r.position
    })
    if (role.position >= highestrole) {
      let msg = await message.channel.send(
        'Your roles must be higher than the role that you want to give!'
      )
      msg.delete({ timeout: 10000 })
      return message.react('❌')
    }

    member.roles.add(role)
    let perms = role.permissions
      .toArray()
      .map(perm => perm)
      .join(`\n`)
    perms = '```' + perms + '```'
    let giveroleembed = new Discord.MessageEmbed()
      .setColor('#00ffbb')
      .setTitle(
        `${message.client.emojis.cache.find(
          emoji => emoji.name === 'pinned'
        )} Given Role`
      )
      .addFields(
        { name: 'To', value: `${member}` },
        { name: 'By', value: `${message.author.username}` },
        { name: 'Role', value: `${role.name}` },
        { name: 'Permissions', value: `${perms}` }
      )
      .setTimestamp()
    let logchname = await logchannels.get(`logchannel_${message.guild.id}`)
    let log = await message.guild.channels.cache.find(
      ch => ch.name === `${logchname}`
    )
    if (log) log.send(giveroleembed)
    else message.channel.send(giveroleembed)
    message.react('✔️')
  }
}
