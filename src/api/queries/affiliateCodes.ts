import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";

export interface AffiliateCode {
  id: number;
  code: string;
  collaborator_name: string;
  collaborator_email: string | null;
  notes: string | null;
  is_active: boolean;
  stripe_connect_account_id: string | null;
  stripe_connect_details_submitted: boolean;
  stripe_connect_charges_enabled: boolean;
  stripe_connect_payouts_enabled: boolean;
  created_at: string;
  updated_at: string;
}

async function getAffiliateCodesQuery() {
  const query = {
    text: /*sql*/ `
      select *
      from public."AffiliateCode"
      order by is_active desc, created_at desc, id desc
    `,
  };
  return await db.query<AffiliateCode>(query);
}

async function getAffiliateCodeByCodeQuery(code: string) {
  const query = {
    text: /*sql*/ `
      select *
      from public."AffiliateCode"
      where code = $1
      limit 1
    `,
    values: [code],
  };
  return await db.query<AffiliateCode>(query);
}

async function getAffiliateCodeByIdQuery(id: string | number) {
  const query = {
    text: /*sql*/ `
      select *
      from public."AffiliateCode"
      where id = $1
      limit 1
    `,
    values: [id],
  };
  return await db.query<AffiliateCode>(query);
}

async function getAffiliateCodeByConnectAccountIdQuery(connectAccountId: string) {
  const query = {
    text: /*sql*/ `
      select *
      from public."AffiliateCode"
      where stripe_connect_account_id = $1
      limit 1
    `,
    values: [connectAccountId],
  };
  return await db.query<AffiliateCode>(query);
}

async function getActiveAffiliateCodeByCodeQuery(code: string) {
  const query = {
    text: /*sql*/ `
      select *
      from public."AffiliateCode"
      where code = $1
        and is_active = true
      limit 1
    `,
    values: [code],
  };
  return await db.query<AffiliateCode>(query);
}

async function addAffiliateCodeQuery(data: {
  code: string;
  collaborator_name: string;
  collaborator_email?: string | null;
  notes?: string | null;
}) {
  const query = {
    text: /*sql*/ `
      insert into public."AffiliateCode" (
        code,
        collaborator_name,
        collaborator_email,
        notes
      )
      values ($1, $2, $3, $4)
      returning *
    `,
    values: [
      data.code,
      data.collaborator_name,
      data.collaborator_email || null,
      data.notes || null,
    ],
  };
  return await db.query<AffiliateCode>(query);
}

async function editAffiliateCodeQuery(
  id: string | number,
  data: Partial<
    Pick<
      AffiliateCode,
      | "code"
      | "collaborator_name"
      | "collaborator_email"
      | "notes"
      | "is_active"
      | "stripe_connect_account_id"
      | "stripe_connect_details_submitted"
      | "stripe_connect_charges_enabled"
      | "stripe_connect_payouts_enabled"
    >
  >,
) {
  const query = buildUpdateQuery("AffiliateCode", data, id);
  return await db.query<AffiliateCode>(query);
}

export {
  getAffiliateCodesQuery,
  getAffiliateCodeByIdQuery,
  getAffiliateCodeByCodeQuery,
  getActiveAffiliateCodeByCodeQuery,
  addAffiliateCodeQuery,
  editAffiliateCodeQuery,
  getAffiliateCodeByConnectAccountIdQuery,
};
