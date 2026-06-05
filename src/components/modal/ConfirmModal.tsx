/*
 * Copyright (C) 2026 Yağız Berke Güvenç
 *
 * This file is part of gemini-booster.
 *
 * gemini-booster is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * gemini-booster is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with gemini-booster. If not, see <https://www.gnu.org/licenses/>.
 */

// components/ConfirmModal.tsx
import React from "react"

interface ConfirmModalProps {
  title: string
  description: React.ReactNode
  onConfirm: () => void
  confirmText: string
  onCancel?: () => void
  cancelText?: string
  variant?: "danger" | "primary"
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  description,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  variant = "danger"
}) => {
  return (
    <>
      <style>{`
        .gbr-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: var(--shadow-primary, rgba(0, 0, 0, 0.6));
          backdrop-filter: blur(2px);
          z-index: 9999999;
          display: flex;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
        }

        .gbr-confirm-modal {
          background-color: var(--bg-secondary, #1e1f20);
          color: var(--color-primary, #e3e3e3);
          padding: 24px;
          border-radius: 28px;
          max-width: 448px;
          width: 90%;
          box-shadow: 0 24px 38px 3px rgba(0, 0, 0, .14), 0 9px 46px 8px rgba(0, 0, 0, .12), 0 11px 15px -7px rgba(0, 0, 0, .2);
          font-family: "Google Sans Flex", "Google Sans", Roboto, Arial, sans-serif !important;
          box-sizing: border-box;
        }

        @media (max-width: 360px) {
          .gbr-confirm-modal {
            max-width: 280px;
            padding: 20px;
            border-radius: 20px;
          }
        }

        .gbr-confirm-modal-title {
          margin: 0 0 16px 0;
          font-size: 22px;
          font-weight: 400;
          text-align: left;
          color: var(--color-primary, #e3e3e3);
        }

        @media (max-width: 360px) {
          .gbr-confirm-modal-title {
            font-size: 18px;
            margin-bottom: 12px;
          }
        }

        .gbr-confirm-modal-text {
          margin: 0 0 24px 0;
          font-size: 14px;
          line-height: 1.5;
          color: var(--color-secondary, #c4c7c5);
          text-align: left;
        }

        @media (max-width: 360px) {
          .gbr-confirm-modal-text {
            font-size: 13px;
            margin-bottom: 20px;
          }
        }

        .gbr-confirm-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .gbr-confirm-modal-btn {
          padding: 10px 24px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: background-color 0.15s, opacity 0.15s;
        }

        @media (max-width: 360px) {
          .gbr-confirm-modal-btn {
            padding: 8px 18px;
            font-size: 13px;
          }
        }

        .gbr-confirm-modal-btn:hover {
          opacity: 0.9;
        }

        .gbr-confirm-modal-btn-cancel {
          background-color: transparent;
          color: var(--color-accent, #a8c7fa);
        }

        .gbr-confirm-modal-btn-cancel:hover {
          background-color: var(--bg-tertiary, rgba(255, 255, 255, 0.08));
        }

        .gbr-confirm-modal-btn-delete {
          background-color: var(--color-danger, #ff605c);
          color: var(--bg-primary, #131314);
        }

        .gbr-confirm-modal-btn-delete:hover {
          background-color: var(--color-danger, #ff605c);
          opacity: 0.85;
        }

        .gbr-confirm-modal-btn-primary {
          background-color: var(--bg-tertiary, rgba(255, 255, 255, 0.08));
          color: var(--color-primary, #e3e3e3);
        }

        .gbr-confirm-modal-btn-primary:hover {
          background-color: var(--border-primary, #444746);
        }
      `}</style>
      <div className="gbr-modal-overlay">
        <div className="gbr-confirm-modal">
          <h3 className="gbr-confirm-modal-title">{title}</h3>
          <div className="gbr-confirm-modal-text">{description}</div>
          <div className="gbr-confirm-modal-actions">
            {onCancel && cancelText && (
              <button onClick={onCancel} className="gbr-confirm-modal-btn gbr-confirm-modal-btn-cancel">
                {cancelText}
              </button>
            )}
            <button
              onClick={onConfirm}
              className={`gbr-confirm-modal-btn ${variant === "danger" ? "gbr-confirm-modal-btn-delete" : "gbr-confirm-modal-btn-primary"}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ConfirmModal
