// components/AlertModal.tsx
import React from "react"

interface AlertModalProps {
  title: string
  message: string
  onClose: () => void
  closeText: string
}

const AlertModal: React.FC<AlertModalProps> = ({
  title,
  message,
  onClose,
  closeText
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
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(2px);
          z-index: 9999999;
          display: flex;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
        }

        .gbr-confirm-modal {
          background-color: #1e1f20;
          color: #e3e3e3;
          padding: 24px;
          border-radius: 16px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          font-family: 'Google Sans', 'Google Sans Flex', 'Segoe UI', Roboto, sans-serif;
          box-sizing: border-box;
        }

        @media (max-width: 360px) {
          .gbr-confirm-modal {
            max-width: 280px;
            padding: 20px;
          }
        }

        .gbr-confirm-modal-title {
          margin: 0 0 16px 0;
          font-size: 20px;
          font-weight: 500;
          text-align: left;
          color: #e3e3e3;
        }

        @media (max-width: 360px) {
          .gbr-confirm-modal-title {
            font-size: 16px;
            margin-bottom: 12px;
          }
        }

        .gbr-confirm-modal-text {
          margin: 0 0 24px 0;
          font-size: 14px;
          line-height: 1.5;
          color: #c4c7c5;
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
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: background-color 0.2s, opacity 0.2s;
        }

        @media (max-width: 360px) {
          .gbr-confirm-modal-btn {
            padding: 8px 16px;
            font-size: 13px;
            border-radius: 6px;
          }
        }

        .gbr-confirm-modal-btn:hover {
          opacity: 0.9;
        }

        .gbr-confirm-modal-btn-primary {
          background-color: #6c5ce7;
          color: #fff;
        }

        .gbr-confirm-modal-btn-primary:hover {
          background-color: #5b4bc4;
        }
      `}</style>
      <div className="gbr-modal-overlay">
        <div className="gbr-confirm-modal">
          <h3 className="gbr-confirm-modal-title">{title}</h3>
          <p className="gbr-confirm-modal-text">{message}</p>
          <div className="gbr-confirm-modal-actions">
            <button onClick={onClose} className="gbr-confirm-modal-btn gbr-confirm-modal-btn-primary">
              {closeText}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default AlertModal
