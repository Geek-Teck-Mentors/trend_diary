export default class ReadHistory {
  constructor(
    public readHistoryId: bigint,
    public userId: bigint,
    public articleId: bigint,
    public readAt: Date,
    public readonly createdAt: Date = new Date(),
  ) {}
}
