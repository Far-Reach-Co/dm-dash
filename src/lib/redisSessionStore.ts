import session from "express-session";

interface RedisSessionClient {
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    options?: { EX?: number },
  ): Promise<string | null>;
  del(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number | boolean>;
}

interface RedisSessionStoreOptions {
  client: RedisSessionClient;
  prefix?: string;
  ttlSeconds?: number;
  disableTouch?: boolean;
}

export default class RedisSessionStore extends session.Store {
  private readonly client: RedisSessionClient;
  private readonly prefix: string;
  private readonly ttlSeconds: number;
  private readonly disableTouch: boolean;

  constructor(options: RedisSessionStoreOptions) {
    super();
    this.client = options.client;
    this.prefix = options.prefix || "sess:";
    this.ttlSeconds = options.ttlSeconds || 24 * 60 * 60;
    this.disableTouch = Boolean(options.disableTouch);
  }

  private getKey(sid: string): string {
    return `${this.prefix}${sid}`;
  }

  private getTtlSeconds(sess: session.SessionData): number {
    const cookieExpiry = sess.cookie?.expires;
    if (cookieExpiry) {
      const expiresAtMs = new Date(cookieExpiry).valueOf();
      if (!Number.isNaN(expiresAtMs)) {
        return Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000));
      }
    }

    const cookieMaxAge = sess.cookie?.maxAge;
    if (typeof cookieMaxAge === "number") {
      return Math.max(0, Math.ceil(cookieMaxAge / 1000));
    }

    return this.ttlSeconds;
  }

  get(
    sid: string,
    callback: (err: any, session?: session.SessionData | null) => void,
  ): void {
    this.client
      .get(this.getKey(sid))
      .then((rawSession) => {
        if (!rawSession) {
          callback(null, null);
          return;
        }

        try {
          callback(null, JSON.parse(rawSession) as session.SessionData);
        } catch {
          this.destroy(sid, callback);
        }
      })
      .catch((err) => callback(err));
  }

  set(
    sid: string,
    sess: session.SessionData,
    callback?: (err?: any) => void,
  ): void {
    const ttlSeconds = this.getTtlSeconds(sess);
    if (ttlSeconds <= 0) {
      this.destroy(sid, callback);
      return;
    }

    this.client
      .set(this.getKey(sid), JSON.stringify(sess), { EX: ttlSeconds })
      .then(() => callback && callback())
      .catch((err) => callback && callback(err));
  }

  destroy(sid: string, callback?: (err?: any) => void): void {
    this.client
      .del(this.getKey(sid))
      .then(() => callback && callback())
      .catch((err) => callback && callback(err));
  }

  touch(
    sid: string,
    sess: session.SessionData,
    callback?: (err?: any) => void,
  ): void {
    if (this.disableTouch) {
      if (callback) callback();
      return;
    }

    const ttlSeconds = this.getTtlSeconds(sess);
    if (ttlSeconds <= 0) {
      this.destroy(sid, callback);
      return;
    }

    this.client
      .expire(this.getKey(sid), ttlSeconds)
      .then(() => callback && callback())
      .catch((err) => callback && callback(err));
  }
}
