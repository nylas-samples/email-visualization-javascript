
// TODO: Using Nylas Email API, save emails as response.json
const emails = require('./response.json')

const nylasEmailRegex = /\@nylas.com/;
const nylasBroadcastEmailRegex = /\broadcast-email@nylas.com/;
const nylasStatusUpdateEmailRegex = /Updated|Invitation:|Accepted:|Document shared with you:|DevRel/;
const externalCompanyEmailRegex = /grammarly.com|atlassian.net|asana|docs.google.com|google.com|canva.com|zoom.us|/;

const emailGroups = {
  nylasBroadcastEmails: { count: 0, emails: {} },
  nylasStatusUpdateEmails: { count: 0, emails: {} },
  nylasEmails: { count: 0, emails: {} },
  companyEmails: { count: 0, emails: {} },
  unorganizedEmails: { count: 0, emails: {} }
}

let totalEmailCount = 0;

const emailArray = emails.map(({ from, subject }) => {
  const sender = from[0].email;

  totalEmailCount++
  return ({
    sender,
    subject
  })
});

const { 
 nylasBroadcastEmails, 
 nylasStatusUpdateEmails, 
 nylasEmails, 
 companyEmails, 
 unorganizedEmails 
} = emailGroups;

const updateSenderCount = (sender, group) => {
 if(!nylasBroadcastEmails.emails[sender]) {
  nylasBroadcastEmails.emails[sender] = 1;
 } else {
  nylasBroadcastEmails.emails[sender]++;
 }
}

emailArray.map(({sender, subject}) => {
  if(nylasBroadcastEmailRegex.test(sender)) {
    nylasBroadcastEmails.count++
    updateSenderCount(sender, nylasBroadcastEmails.emails)
    return;
  }

  if(nylasStatusUpdateEmailRegex.test(subject)) {
    nylasStatusUpdateEmails.count++;
    updateSenderCount(sender, nylasStatusUpdateEmails.emails)
    return;
  }

  if(nylasEmailRegex.test(sender)) {
    nylasEmails.count++;
    updateSenderCount(sender, nylasEmails.emails)
    return;
  }

  if(externalCompanyEmailRegex.test(sender)) {
    companyEmails.count++;
    updateSenderCount(sender, companyEmails.emails);
    return;
  }

  unorganizedEmails.count++;
  updateSenderCount(sender, unorganizedEmails.emails);
});

const createGroup = (label, weight, emails) => ({
  label,
  weight,
  groups: Object.keys(emails).map(email => ({
    label: `${email} - ${emails[email]}`,
    weight: emails[email],
    groups: []
  }))
})

const nylasEmailsCount =  nylasBroadcastEmails.count + nylasStatusUpdateEmails.count + nylasEmails.count;
const externalEmailsCount = companyEmails.count + unorganizedEmails.count;

const groups = {
  label: "",
  weight: totalEmailCount,
  groups: [
    {
      label: `@nylas emails ${nylasEmailsCount}`,
      weight: nylasEmailsCount,
      groups: [
        createGroup('team messages', nylasBroadcastEmails.count, nylasBroadcastEmails.emails),
        createGroup('status updates', nylasStatusUpdateEmails.count, nylasStatusUpdateEmails.emails),
        createGroup('email messages', nylasEmails.count, nylasEmails.emails),
      ]
    },
    {
      label: `@external emails ${externalEmailsCount}`,
      weight: externalEmailsCount,
      groups: [
        createGroup('company/tools', companyEmails.count, companyEmails.emails),
        createGroup('unorganized', unorganizedEmails.count, unorganizedEmails.emails),
      ]
    }
  ]
}

export { groups }