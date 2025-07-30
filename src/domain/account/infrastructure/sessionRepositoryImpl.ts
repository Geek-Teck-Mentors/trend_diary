import { AsyncResult, Nullable, resultError, resultSuccess } from '@/common/types/utility'
import { RdbClient } from '@/infrastructure/rdb'
import Session from '../model/session'
import { SessionRepository } from '../repository/sessionRepository'
import { SessionInput, SessionUpdate } from '../schema/sessionSchema'

export default class SessionRepositoryImpl implements SessionRepository {
  constructor(private db: RdbClient) {}

  async create(input: SessionInput): AsyncResult<Session, Error> {
    try {
      const session = await this.db.session.create({
        data: {
          sessionId: input.sessionId,
          activeUserId: input.activeUserId,
          sessionToken: input.sessionToken,
          expiresAt: input.expiresAt,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        },
      })

      return resultSuccess(
        new Session(
          session.sessionId,
          session.activeUserId,
          session.sessionToken ?? undefined,
          session.expiresAt,
          session.ipAddress ?? undefined,
          session.userAgent ?? undefined,
          session.createdAt,
        ),
      )
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error('Unknown error'))
    }
  }

  async findById(sessionId: string): AsyncResult<Nullable<Session>, Error> {
    try {
      const session = await this.db.session.findUnique({
        where: { sessionId },
      })

      if (!session) {
        return resultSuccess(null)
      }

      return resultSuccess(
        new Session(
          session.sessionId,
          session.activeUserId,
          session.sessionToken ?? undefined,
          session.expiresAt,
          session.ipAddress ?? undefined,
          session.userAgent ?? undefined,
          session.createdAt,
        ),
      )
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error('Unknown error'))
    }
  }

  async findByActiveUserId(activeUserId: bigint): AsyncResult<Nullable<Session>, Error> {
    try {
      const session = await this.db.session.findUnique({
        where: { activeUserId },
      })

      if (!session) {
        return resultSuccess(null)
      }

      return resultSuccess(
        new Session(
          session.sessionId,
          session.activeUserId,
          session.sessionToken ?? undefined,
          session.expiresAt,
          session.ipAddress ?? undefined,
          session.userAgent ?? undefined,
          session.createdAt,
        ),
      )
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error('Unknown error'))
    }
  }

  async update(sessionId: string, updates: SessionUpdate): AsyncResult<Session, Error> {
    try {
      const session = await this.db.session.update({
        where: { sessionId },
        data: updates,
      })

      return resultSuccess(
        new Session(
          session.sessionId,
          session.activeUserId,
          session.sessionToken ?? undefined,
          session.expiresAt,
          session.ipAddress ?? undefined,
          session.userAgent ?? undefined,
          session.createdAt,
        ),
      )
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error('Unknown error'))
    }
  }

  async delete(sessionId: string): AsyncResult<void, Error> {
    try {
      await this.db.session.delete({
        where: { sessionId },
      })
      return resultSuccess(undefined)
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error('Unknown error'))
    }
  }

  async deleteExpired(): AsyncResult<number, Error> {
    try {
      const result = await this.db.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      })
      return resultSuccess(result.count)
    } catch (error) {
      return resultError(error instanceof Error ? error : new Error('Unknown error'))
    }
  }
}
