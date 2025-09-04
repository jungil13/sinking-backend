import  Member  from '../models/Member.js';

export const getMembers = async (req, res) => {
  try {
    const search = req.query.search || '';
    const members = await Member.getAll(search);
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch members' });
  }
};

export const getMemberTransactions = async (req, res) => {
  try {
    const { memberID } = req.params;
    const member = await Member.getById(memberID);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const transactions = await Member.getTransactions(memberID);
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};
